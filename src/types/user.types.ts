// Definition du type User
export interface User {
  uid : string;
  email : string;
  displayName : string | null;
  createdAT : Date ;
  lastLogin : Date ;

}

// Definition du type AuthContextType
export interface AuthContextType {
  user : User | null;
  loading: boolean;
  login: (email : string , password: string) => Promise<void>;
  register :(email: string, password: string, name: string) => Promise<void>; 
  logout : () => Promise<void>;
}
