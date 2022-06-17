const formatMessage = (text: string) => {
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text,
    },
  }
}

export { formatMessage }