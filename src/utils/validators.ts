// API essentielle de zod , permet de decrire la forme et les regles des donnees
import { z } from 'zod';


/**
 * definition de l'ojet login 
 * restriction sur l'email : string , pas de champ vide ,
 * restriction sur le password : string , Minimum 6 caracteres 
 */
export const loginSchema = z.object({
  email: z.string().min(6, 'Email required').email('Invalid email address'),
  password: z.string().min(6, 'Min. 6 characters')
});

/**
 * definition de l'objet register 
 * restriction sur le nom : pas de champ vide , min 2 caracteres 
 * restriction sur l'email : string , pas de champ vide
 * restriction sur le password : string , Minimum 6 caracteres ,Majuscule et 
 * chiffres obligatoires 
 * confirmation password 
 * refine : verifie chaque champ , verifie si le mot de passe correspond 
 */
export const registerSchema = z.object({
  displayName: z.string().min(6, 'Min. 6 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(6, 'Min. 6 characters')
    .regex(/[A-Z]/, 'At least one capital letter')
    .regex(/[0-9]/, 'At least one number'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Different passwords',
  path: ['confirmPassword']
});

