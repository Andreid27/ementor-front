const timeBetween = (start, end) => {
  const startDate = new Date(start); // Parse the start OffsetDateTime
  const endDate = new Date(end);     // Parse the end OffsetDateTime

  // Calculate the difference in milliseconds
  const differenceInMs = endDate - startDate;

  const differenceInMinutes = Math.floor(differenceInMs / 1000 / 60);

  return differenceInMinutes + ' minute';
};

export default timeBetween;
