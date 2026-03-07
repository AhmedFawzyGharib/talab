export const generateEmail = (role, phone) => {
  const prefix =
    role === "driver"
      ? "driver"
      : role === "merchant"
      ? "merchant"
      : "admin";

  return `${prefix}_${phone}@talab.app`;
};