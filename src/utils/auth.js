export function isAdmin(user) {
  if (typeof user?.isAdmin === 'boolean') return user.isAdmin;

  return (Array.isArray(user?.roles) && user.roles.includes('ADMIN'))
    || (Array.isArray(user?.authorities) && user.authorities.includes('ROLE_ADMIN'));
}

export function getPostLoginPath(user) {
  return isAdmin(user) ? '/dashboard' : '/';
}
