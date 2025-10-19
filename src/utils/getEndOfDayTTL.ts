export const getEndOfDayTTL = () => {
  const now = new Date();
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );
  const ttlInSeconds = Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
  return ttlInSeconds;
};
