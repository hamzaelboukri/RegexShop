'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, X, Loader2, Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { z } from 'zod';
import { useCategories } from '@/hooks/use-products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Product } from '@/types';

// Schema for product form
const productFormSchema = z.object({
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

export type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductAttribute {
  name: string;
  value: string;
}

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData & { images: string[]; attributes?: ProductAttribute[] }) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  title: string;
  subtitle: string;
}

export default function ProductForm({
  product,
  onSubmit,
  isLoading,
  submitLabel = 'Enregistrer',
  title,
  subtitle,
}: ProductFormProps) {
  const router = useRouter();
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [attributes, setAttributes] = useState<ProductAttribute[]>(
    product?.attributes || []
  );

  const { data: categories } = useCategories();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      comparePrice: product?.comparePrice || undefined,
      categoryId: product?.categoryId || '',
      sku: product?.sku || '',
      isActive: product?.isActive ?? true,
      isFeatured: product?.isFeatured ?? false,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice || undefined,
        categoryId: product.categoryId,
        sku: product.sku,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      });
      setImages(product.images || []);
      setAttributes(product.attributes || []);
    }
  }, [product, reset]);

  const addImageUrl = () => {
    if (!newImageUrl.trim()) {
      toast.error('Veuillez entrer une URL d\'image');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(newImageUrl);
    } catch {
      toast.error('URL invalide');
      return;
    }
    
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
    toast.success('Image ajoutée');
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addAttribute = () => {
    setAttributes((prev) => [...prev, { name: '', value: '' }]);
  };

  const updateAttribute = (index: number, field: 'name' | 'value', value: string) => {
    setAttributes((prev) =>
      prev.map((attr, i) => (i === index ? { ...attr, [field]: value } : attr))
    );
  };

  const removeAttribute = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    if (images.length === 0) {
      toast.error('Veuillez ajouter au moins une image');
      return;
    }

    const validAttributes = attributes.filter(
      (attr) => attr.name.trim() && attr.value.trim()
    );

    await onSubmit({
      ...data,
      images,
      attributes: validAttributes.length > 0 ? validAttributes : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main info */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du produit *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Ex: T-shirt Premium"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    {...register('description')}
                    className="min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Décrivez votre produit..."
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      {...register('sku')}
                      placeholder="Ex: TSH-001"
                    />
                    {errors.sku && (
                      <p className="text-sm text-destructive">{errors.sku.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Catégorie *</Label>
                    <select
                      id="categoryId"
                      {...register('categoryId')}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className="text-sm text-destructive">
                        {errors.categoryId.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://exemple.com/image.jpg"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addImageUrl();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addImageUrl}>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Ajouter
                  </Button>
                </div>
                
                {images.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-4">
                    {images.map((url, index) => (
                      <div key={index} className="group relative aspect-square">
                        <Image
                          src={url}
                          alt={`Product ${index + 1}`}
                          fill
                          className="rounded-lg object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 rounded bg-primary px-2 py-1 text-xs text-white">
                            Principal
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Ajoutez des URLs d&apos;images. La première sera l&apos;image principale.
                </p>
              </CardContent>
            </Card>

            {/* Attributes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Attributs</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter
                </Button>
              </CardHeader>
              <CardContent>
                {attributes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucun attribut. Ajoutez des attributs comme Taille, Couleur, Matière...
                  </p>
                ) : (
                  <div className="space-y-3">
                    {attributes.map((attr, index) => (
                      <div key={index} className="flex gap-3">
                        <Input
                          placeholder="Nom (ex: Couleur)"
                          value={attr.name}
                          onChange={(e) => updateAttribute(index, 'name', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Valeur (ex: Rouge)"
                          value={attr.value}
                          onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAttribute(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prix & Stock</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (€) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comparePrice">Ancien prix (€)</Label>
                  <Input
                    id="comparePrice"
                    type="number"
                    step="0.01"
                    {...register('comparePrice', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground">
                    Affiche le prix barré pour montrer une réduction
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statut</CardTitle>
              </CardHeader>
              <CardContent>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register('isActive')} className="rounded" />
                  <span className="text-sm">Produit actif</span>
                </label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Les produits inactifs ne sont pas visibles dans la boutique
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                Annuler
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitLabel}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
