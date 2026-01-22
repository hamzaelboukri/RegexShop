'use client';

import Link from 'next/link';
import { ArrowLeft, RotateCcw, Package, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function ReturnsPage() {
  const steps = [
    {
      icon: Package,
      title: 'Demandez un retour',
      description: 'Connectez-vous à votre compte et sélectionnez "Demander un retour" dans vos commandes.',
    },
    {
      icon: RotateCcw,
      title: 'Préparez votre colis',
      description: 'Emballez soigneusement l\'article dans son emballage d\'origine si possible.',
    },
    {
      icon: Clock,
      title: 'Déposez le colis',
      description: 'Déposez votre colis au point relais indiqué avec l\'étiquette de retour imprimée.',
    },
    {
      icon: CheckCircle,
      title: 'Recevez votre remboursement',
      description: 'Une fois le retour validé, vous êtes remboursé sous 14 jours.',
    },
  ];

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
            Retours & Remboursements
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Notre politique de retour simple et transparente pour votre tranquillité d&apos;esprit.
          </p>
        </div>

        {/* Return Policy Highlight */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-12">
          <div className="flex items-center justify-center space-x-8 flex-wrap gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">14</p>
              <p className="text-sm text-gray-600">jours pour retourner</p>
            </div>
            <div className="h-12 w-px bg-primary/20 hidden sm:block" />
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">Gratuit</p>
              <p className="text-sm text-gray-600">pour articles défectueux</p>
            </div>
            <div className="h-12 w-px bg-primary/20 hidden sm:block" />
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">14</p>
              <p className="text-sm text-gray-600">jours pour le remboursement</p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Comment retourner un article ?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Conditions de retour
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Articles acceptés
              </h3>
              <ul className="list-disc pl-8 text-gray-600 space-y-1">
                <li>Article dans son état d&apos;origine, non utilisé et non lavé</li>
                <li>Étiquettes d&apos;origine attachées</li>
                <li>Emballage d&apos;origine inclus si possible</li>
                <li>Retour effectué dans les 14 jours suivant la réception</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                Articles non retournables
              </h3>
              <ul className="list-disc pl-8 text-gray-600 space-y-1">
                <li>Articles personnalisés ou sur mesure</li>
                <li>Sous-vêtements et maillots de bain (pour raisons d&apos;hygiène)</li>
                <li>Produits scellés qui ont été ouverts</li>
                <li>Articles soldés ou en promotion finale</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Refund Info */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Remboursement
          </h2>
          
          <div className="space-y-4 text-gray-600">
            <p>
              Une fois votre retour réceptionné et vérifié par notre équipe, le remboursement 
              est effectué sous 14 jours ouvrés. Le montant sera crédité sur le moyen de 
              paiement utilisé lors de l&apos;achat.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Ce qui est remboursé :</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Le prix de l&apos;article retourné</li>
                <li>Les frais de livraison initiaux (si retour complet de la commande)</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Frais de retour :</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Gratuits</strong> pour les articles défectueux ou non conformes</li>
                <li><strong>4,99 €</strong> déduits du remboursement pour les retours par convenance</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Exchange */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Échange
          </h2>
          
          <p className="text-gray-600 mb-4">
            Pour échanger un article (taille différente, autre couleur), nous vous recommandons 
            de retourner l&apos;article et de passer une nouvelle commande. Cela vous garantit 
            la disponibilité de l&apos;article souhaité.
          </p>
          
          <p className="text-gray-600">
            Si vous avez des questions sur les retours ou les échanges, n&apos;hésitez pas à 
            <Link href="/contact" className="text-primary hover:underline"> contacter notre service client</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
