'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/stores/cart.store';
import { useAuth } from '@/stores/auth.store';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, itemCount, subtotal, discount, shipping, tax, total, updateQuantity, removeItem, couponCode, applyCoupon, removeCoupon } = useCart();
  const { isAuthenticated } = useAuth();
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    
    setIsApplyingCoupon(true);
    // Simulate API call - in real app, validate coupon with backend
    setTimeout(() => {
      applyCoupon(couponInput.toUpperCase(), subtotal * 0.1); // 10% discount example
      setCouponInput('');
      setIsApplyingCoupon(false);
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col bg-background shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Panier ({itemCount})</h2>
              </div>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                  <p className="mt-4 text-lg font-medium">Votre panier est vide</p>
                  <p className="text-sm text-muted-foreground">
                    Ajoutez des produits pour commencer
                  </p>
                  <Button onClick={onClose} className="mt-4">
                    Continuer vos achats
                  </Button>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="flex gap-4 rounded-lg border p-3"
                      >
                        {/* Image */}
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                          <Image
                            src={item.product.images[0] || '/placeholder.jpg'}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex flex-1 flex-col">
                          <Link
                            href={`/products/${item.productId}`}
                            onClick={onClose}
                            className="font-medium hover:text-primary"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.price)}
                          </p>

                          {/* Quantity controls */}
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="rounded-md border p-1 hover:bg-muted"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= (item.product.stock ?? 999)}
                              className="rounded-md border p-1 hover:bg-muted disabled:opacity-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="ml-auto rounded-md p-1 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Item total */}
                        <div className="text-right font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-4">
                {/* Coupon */}
                {!couponCode ? (
                  <div className="mb-4 flex gap-2">
                    <Input
                      placeholder="Code promo"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      isLoading={isApplyingCoupon}
                    >
                      Appliquer
                    </Button>
                  </div>
                ) : (
                  <div className="mb-4 flex items-center justify-between rounded-md bg-green-50 p-2 dark:bg-green-900/20">
                    <span className="text-sm text-green-600 dark:text-green-400">
                      Code {couponCode} appliqué
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-sm text-destructive hover:underline"
                    >
                      Retirer
                    </button>
                  </div>
                )}

                {/* Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Réduction</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span>{shipping === 0 ? 'Gratuite' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA (20%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-base font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Checkout button */}
                <Link
                  href={isAuthenticated ? '/checkout' : '/auth/login?redirect=/checkout'}
                  onClick={onClose}
                >
                  <Button className="mt-4 w-full" size="lg">
                    {isAuthenticated ? 'Procéder au paiement' : 'Se connecter pour commander'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                {!isAuthenticated && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Connectez-vous pour finaliser votre commande
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
