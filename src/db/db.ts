import { Database } from 'sqlite3';
import * as fs from 'fs';

let DB_PATH = process.env.DB_PATH ?? '';
if (!DB_PATH) {
  console.log(
    'Please add a new environment variable DB_PATH on your .env file that points to a file that will be a database, for example /home/ubuntu/db.db'
  );
  process.exit(1);
}

/**
 * Static methods to manage database.
 */

type entity = 'QUESTIONS' | 'ANSWERS';

export class DB {
  static DB_PATH: string;

  static addPlayer(userId: string, name: string) {
    return new Promise((resolve, reject) => {
      let db = new Database(DB_PATH);
      db.run(`insert into PLAYERS (userId,name) values (?,?)`, [userId, name], (err: any) => {
        if (err == null) {
          db.get(`SELECT last_insert_rowid() as id`, (err2: any, row: any) => {
            if (err2 == null) {
              resolve(row);
            }
          });
        }
      });
      db.close();
    });
  }

  static findPlayerByUserId(userId: string) {
    return new Promise((resolve, reject) => {
      let db = new Database(DB_PATH);
      db.get(`select * from PLAYERS where userId = (?)`, [userId], (err: any,row:any) => {
        if (err == null) {
          resolve(row);
        }else{
          resolve(false);
        }
      });
      db.close();
    });
  }

  static addQuestion(text: string, cb: Function) {
    let db = new Database(DB_PATH);
    db.run(`insert into QUESTIONS (text) values (?)`, [text], cb);
    db.close();
  }

  static addAnswer(text: string, expert_name: string, cb: Function) {
    let db = new Database(DB_PATH);
    db.run(`insert into ANSWERS (text, expert_name) values (?, ?)`, [text, expert_name], cb);
    db.close();
  }

  static getAll(name: entity) {
    return new Promise((resolve, reject) => {
      let db = new Database(DB_PATH);
      return db.all(`SELECT * FROM ${name}`, [], (err, rows) => {
        if (!rows) {
          reject(err);
        } else {
          if (err) {
            console.error(err);
          }
          resolve(rows);
        }
      });
    });
  }

  static getEntry(name: entity, id: number) {
    return new Promise((resolve, reject) => {
      let db = new Database(DB_PATH);
      return db.all(`SELECT * FROM ${name} WHERE id = ?`, [id], (err, rows) => {
        if (!rows) {
          reject(err);
        } else {
          if (err) {
            console.error(err);
          }
          resolve(rows);
        }
      });
    });
  }

  static deleteEntry(name: entity, id: number): Promise<{}> {
    let db = new Database(DB_PATH);
    let errors: any[] = [];

    // Check that the logged in user is either an admin or the entry owner
    let entry: Promise<{}> = new Promise((rej, res) => {
      db.get(`SELECT * FROM ${name} WHERE id = ? LIMIT 1`, [id], (row, err) => {
        if (row) {
          res(row);
        } else {
          rej(err);
        }
      });
    });

    return new Promise((res, rej) => {
      db.run(`DELETE FROM ${name} WHERE id = ?`, [id], (err) => {
        if (err) {
          errors.push(err);
          rej(errors);
        } else {
          res(true);
        }
      });
    });
  }

  /**
   * Caution: resets database.
   */
  static setupDatabase() {
    let db = new Database(DB_PATH);
    console.log('setupDatabase');
    try {
      db.serialize(() => {
        db.run(
          `
          CREATE TABLE QUESTIONS (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
            title TEXT NOT NULL,
            status TEXT NOT NULL,
            answerId INTEGER,
            authorId INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(authorId) REFERENCES PLAYERS(id)
          );
       `,
          (r) => {
            console.log(r);
          }
        );
        db.run(
          `
          CREATE TABLE ANSWERS (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
            content TEXT NOT NULL,
            questionId INTEGER NOT NULL,
            expertId INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(expertId) REFERENCES PLAYERS(id),
            FOREIGN KEY(questionId) REFERENCES QUESTIONS(id)
          );
       `,
          (r) => {
            console.log(r);
          }
        );
        db.run(
          `
          CREATE TABLE PLAYERS (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
            userId TEXT NOT NULL,
            name TEXT NOT NULL
          );
       `,
          (r) => {
            console.log(r);
          }
        );
      });
    } catch (err) {
      console.error(err);
    } finally {
      db.close();
    }
  }
}

export const initDB = () => {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, '');
    DB.setupDatabase();
  }
};
