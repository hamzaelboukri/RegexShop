'use client';

import Link from 'next/link';
import { ArrowLeft, Truck, Clock, MapPin, Package } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-primary hover:underline mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l&apos;accueil
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Livraison
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez nos options de livraison et nos délais.
          </p>
        </div>

        {/* Delivery Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Livraison Standard</h3>
                <p className="text-2xl font-bold text-primary">4,99 €</p>
              </div>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                3 à 5 jours ouvrés
              </li>
              <li className="flex items-center">
                <Package className="h-4 w-4 mr-2 text-gray-400" />
                Suivi de colis inclus
              </li>
            </ul>
            <p className="mt-4 text-sm text-green-600 font-medium">
              Gratuite dès 50€ d&apos;achat !
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-primary">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Livraison Express</h3>
                <p className="text-2xl font-bold text-primary">9,99 €</p>
              </div>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                1 à 2 jours ouvrés
              </li>
              <li className="flex items-center">
                <Package className="h-4 w-4 mr-2 text-gray-400" />
                Livraison prioritaire
              </li>
            </ul>
            <p className="mt-4 text-sm text-primary font-medium">
              Commandez avant 14h pour une expédition le jour même
            </p>
          </div>
        </div>

        {/* Delivery Zones */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <MapPin className="h-6 w-6 mr-2 text-primary" />
            Zones de livraison
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">France métropolitaine</h3>
              <p className="text-gray-600">
                Livraison disponible sur l&apos;ensemble du territoire métropolitain. 
                Les délais peuvent varier légèrement selon votre localisation.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Belgique, Suisse, Luxembourg</h3>
              <p className="text-gray-600">
                Livraison disponible avec un délai supplémentaire de 1 à 2 jours ouvrés. 
                Des frais de port additionnels peuvent s&apos;appliquer.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">DOM-TOM et International</h3>
              <p className="text-gray-600">
                Pour les livraisons en dehors des zones mentionnées, veuillez nous 
                <Link href="/contact" className="text-primary hover:underline"> contacter</Link> pour 
                obtenir un devis personnalisé.
              </p>
            </div>
          </div>
        </div>

        {/* Important Info */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Informations importantes
          </h2>
          
          <div className="space-y-4 text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Suivi de commande</h3>
              <p>
                Dès l&apos;expédition de votre colis, vous recevez un email avec le numéro de suivi. 
                Vous pouvez également suivre votre commande depuis votre espace client.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Absence lors de la livraison</h3>
              <p>
                En cas d&apos;absence, un avis de passage sera déposé dans votre boîte aux lettres. 
                Votre colis sera disponible au point relais le plus proche pendant 14 jours.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Colis endommagé</h3>
              <p>
                Si vous constatez des dommages sur votre colis à la réception, refusez-le 
                et contactez notre service client dans les 48h avec des photos du colis et du contenu.
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Besoin d&apos;aide ?</strong> Notre équipe est disponible pour répondre 
              à vos questions. <Link href="/contact" className="text-primary hover:underline">Contactez-nous</Link> ou 
              consultez notre <Link href="/faq" className="text-primary hover:underline">FAQ</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
