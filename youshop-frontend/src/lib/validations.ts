import { z } from 'zod';

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Email invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register Schema
export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Email invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
  confirmPassword: z.string().min(1, 'Veuillez confirmer votre mot de passe'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Address Schema
export const addressSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  street: z.string().min(1, 'L\'adresse est requise'),
  city: z.string().min(1, 'La ville est requise'),
  state: z.string().min(1, 'La région/état est requis'),
  postalCode: z
    .string()
    .min(1, 'Le code postal est requis')
    .regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)'),
  country: z.string().min(1, 'Le pays est requis'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\+33|0)[1-9](\d{2}){4}$/.test(val.replace(/\s/g, '')),
      'Numéro de téléphone invalide'
    ),
  isDefault: z.boolean().default(false),
});

export type AddressFormData = z.infer<typeof addressSchema>;

// Product Schema (Admin)
export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .min(3, 'Le nom doit contenir au moins 3 caractères'),
  description: z
    .string()
    .min(1, 'La description est requise')
    .min(10, 'La description doit contenir au moins 10 caractères'),
  price: z
    .number()
    .min(0.01, 'Le prix doit être supérieur à 0')
    .max(999999.99, 'Le prix est trop élevé'),
  comparePrice: z
    .number()
    .min(0, 'Le prix comparé doit être positif')
    .optional()
    .nullable(),
  categoryId: z.string().uuid('Veuillez sélectionner une catégorie'),
  sku: z
    .string()
    .min(1, 'Le SKU est requis')
    .min(3, 'Le SKU doit contenir au moins 3 caractères'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export type ProductFormData = z.infer<typeof productSchema>;

// Checkout Schema
export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  sameAsShipping: z.boolean().default(true),
  notes: z.string().max(500, 'Les notes ne peuvent pas dépasser 500 caractères').optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Review Schema
export const reviewSchema = z.object({
  rating: z.number().min(1, 'La note est requise').max(5, 'La note maximale est 5'),
  title: z.string().max(100, 'Le titre ne peut pas dépasser 100 caractères').optional(),
  comment: z
    .string()
    .min(10, 'L\'avis doit contenir au moins 10 caractères')
    .max(1000, 'L\'avis ne peut pas dépasser 1000 caractères'),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

// Coupon Schema
export const couponSchema = z.object({
  code: z
    .string()
    .min(1, 'Le code promo est requis')
    .toUpperCase(),
});

export type CouponFormData = z.infer<typeof couponSchema>;

// Contact Schema
export const contactSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  email: z.string().min(1, 'L\'email est requis').email('Email invalide'),
  subject: z.string().min(1, 'Le sujet est requis'),
  message: z
    .string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(2000, 'Le message ne peut pas dépasser 2000 caractères'),
});

export type ContactFormData = z.infer<typeof contactSchema>;
