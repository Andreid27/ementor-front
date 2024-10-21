const timeAgo = (isoDateString) => {
  const date = new Date(isoDateString); // Parse the OffsetDateTime string into a JavaScript Date
  const seconds = Math.floor((new Date() - date) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " ani";
  }

  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " luni";
  }

  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " zile";
  }

  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " ore";
  }

  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minute";
  }

  return Math.floor(seconds) + " secunde";
};


export default timeAgo
