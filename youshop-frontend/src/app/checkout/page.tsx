'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  CreditCard,
  Truck,
  CheckCircle,
  Shield,
  Loader2,
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useCart } from '@/stores/cart.store';
import { useAuth } from '@/stores/auth.store';
import { checkoutSchema, type CheckoutFormData } from '@/lib/validations';
import { createOrder } from '@/services/orders.service';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ''
);

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

function CheckoutForm() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const { user, isAuthenticated } = useAuth();
  const {
    items,
    subtotal,
    tax,
    shipping,
    total,
    discount,
    couponCode,
    clearCart,
  } = useCart();

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'France',
        isDefault: false,
      },
      sameAsShipping: true,
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/checkout');
    }
    if (items.length === 0 && !orderComplete) {
      router.push('/cart');
    }
  }, [isAuthenticated, items.length, orderComplete, router]);

  const onShippingSubmit = () => {
    setStep('payment');
  };

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setIsProcessing(true);

    try {
      // Create payment method
      const { error: pmError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });

      if (pmError) {
        toast.error(pmError.message || 'Erreur de paiement');
        setIsProcessing(false);
        return;
      }

      // Create order
      const formData = getValues();
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: {
          firstName: formData.shippingAddress.firstName,
          lastName: formData.shippingAddress.lastName,
          street: formData.shippingAddress.street,
          city: formData.shippingAddress.city,
          state: formData.shippingAddress.state,
          postalCode: formData.shippingAddress.postalCode,
          country: formData.shippingAddress.country,
          phone: formData.shippingAddress.phone,
        },
        billingAddress: formData.sameAsShipping
          ? undefined
          : formData.billingAddress
            ? {
                firstName: formData.billingAddress.firstName,
                lastName: formData.billingAddress.lastName,
                street: formData.billingAddress.street,
                city: formData.billingAddress.city,
                state: formData.billingAddress.state,
                postalCode: formData.billingAddress.postalCode,
                country: formData.billingAddress.country,
                phone: formData.billingAddress.phone,
              }
            : undefined,
        paymentMethodId: paymentMethod.id,
        couponCode: couponCode || undefined,
        notes: formData.notes,
      };

      const response = await createOrder(orderData);

      // Clear cart and show success
      clearCart();
      setOrderNumber(response.orderNumber);
      setOrderComplete(true);
      setStep('confirmation');
      toast.success('Commande passée avec succès !');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la commande');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">Merci pour votre commande !</h1>
        <p className="mb-2 text-muted-foreground">
          Votre commande a été confirmée
        </p>
        <p className="mb-8 font-mono text-lg">
          N° de commande: <strong>{orderNumber}</strong>
        </p>
        <p className="mb-8 text-sm text-muted-foreground">
          Vous recevrez un email de confirmation avec les détails de votre commande
          et les informations de suivi.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/account/orders">
            <Button>Voir mes commandes</Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">Continuer mes achats</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/cart">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Finaliser la commande</h1>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                step === 'shipping' || step === 'payment'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <Truck className="h-5 w-5" />
            </div>
            <span className="ml-2 hidden sm:inline">Livraison</span>
          </div>
          <div className="mx-4 h-0.5 w-16 bg-muted" />
          <div className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                step === 'payment'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <CreditCard className="h-5 w-5" />
            </div>
            <span className="ml-2 hidden sm:inline">Paiement</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          {step === 'shipping' && (
            <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">
                  Adresse de livraison
                </h2>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="shippingAddress.firstName">Prénom *</Label>
                      <Input
                        id="shippingAddress.firstName"
                        {...register('shippingAddress.firstName')}
                        error={errors.shippingAddress?.firstName?.message}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingAddress.lastName">Nom *</Label>
                      <Input
                        id="shippingAddress.lastName"
                        {...register('shippingAddress.lastName')}
                        error={errors.shippingAddress?.lastName?.message}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress.phone">Téléphone</Label>
                    <Input
                      id="shippingAddress.phone"
                      type="tel"
                      {...register('shippingAddress.phone')}
                      error={errors.shippingAddress?.phone?.message}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress.street">Adresse *</Label>
                    <Input
                      id="shippingAddress.street"
                      {...register('shippingAddress.street')}
                      error={errors.shippingAddress?.street?.message}
                      placeholder="Numéro et nom de rue"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="shippingAddress.postalCode">Code postal *</Label>
                      <Input
                        id="shippingAddress.postalCode"
                        {...register('shippingAddress.postalCode')}
                        error={errors.shippingAddress?.postalCode?.message}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="shippingAddress.city">Ville *</Label>
                      <Input
                        id="shippingAddress.city"
                        {...register('shippingAddress.city')}
                        error={errors.shippingAddress?.city?.message}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress.state">Région *</Label>
                    <Input
                      id="shippingAddress.state"
                      {...register('shippingAddress.state')}
                      error={errors.shippingAddress?.state?.message}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress.country">Pays *</Label>
                    <select
                      id="shippingAddress.country"
                      {...register('shippingAddress.country')}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Luxembourg">Luxembourg</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">
                  Notes de commande
                </h2>
                <textarea
                  {...register('notes')}
                  placeholder="Instructions spéciales pour la livraison..."
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                />
              </div>

              <Button type="submit" size="lg" className="w-full">
                Continuer vers le paiement
              </Button>
            </form>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">
                  Informations de paiement
                </h2>
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: 'hsl(var(--foreground))',
                            '::placeholder': {
                              color: 'hsl(var(--muted-foreground))',
                            },
                          },
                        },
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Paiement sécurisé par Stripe</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setStep('shipping')}
                  disabled={isProcessing}
                >
                  Retour
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handlePayment}
                  disabled={isProcessing || !stripe}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    `Payer ${formatPrice(total)}`
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Récapitulatif</h2>

            {/* Items */}
            <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.product?.images?.[0] && (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Réduction{couponCode ? ` (${couponCode})` : ''}</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Livraison</span>
                <span>
                  {shipping === 0 ? 'Gratuite' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA (20%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
