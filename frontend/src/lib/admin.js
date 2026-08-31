export const isAdmin = (userOrEmail) => {
  if (!userOrEmail) return false;
  if (typeof userOrEmail === "string") {
    return userOrEmail.toLowerCase() === "mediroutehealth@gmail.com";
  }
  return userOrEmail.role === "admin" || (userOrEmail.email && userOrEmail.email.toLowerCase() === "mediroutehealth@gmail.com");
};

export const adminLib = { isAdmin };