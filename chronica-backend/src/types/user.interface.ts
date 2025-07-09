export interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
}

export interface AuthenticatedRequest extends Request {
  user: User;
}
