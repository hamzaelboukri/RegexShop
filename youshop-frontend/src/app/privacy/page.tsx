'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Politique de Confidentialité
          </h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Dernière mise à jour : Janvier 2026
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Collecte des informations
              </h2>
              <p className="text-gray-600 mb-4">
                Nous collectons les informations que vous nous fournissez directement, notamment :
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Nom et prénom</li>
                <li>Adresse email</li>
                <li>Adresse de livraison</li>
                <li>Numéro de téléphone</li>
                <li>Informations de paiement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. Utilisation des informations
              </h2>
              <p className="text-gray-600 mb-4">
                Nous utilisons vos informations pour :
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Traiter et livrer vos commandes</li>
                <li>Vous envoyer des confirmations et mises à jour</li>
                <li>Répondre à vos questions et demandes</li>
                <li>Améliorer nos services</li>
                <li>Vous envoyer des offres promotionnelles (avec votre consentement)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. Protection des données
              </h2>
              <p className="text-gray-600">
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger 
                vos informations personnelles contre tout accès non autorisé, modification, 
                divulgation ou destruction. Vos données de paiement sont cryptées et 
                traitées de manière sécurisée via nos partenaires de paiement certifiés.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                4. Cookies
              </h2>
              <p className="text-gray-600">
                Notre site utilise des cookies pour améliorer votre expérience de navigation. 
                Les cookies nous permettent de mémoriser vos préférences et de comprendre 
                comment vous utilisez notre site. Vous pouvez configurer votre navigateur 
                pour refuser les cookies, mais cela peut affecter certaines fonctionnalités.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                5. Partage des informations
              </h2>
              <p className="text-gray-600">
                Nous ne vendons pas vos informations personnelles. Nous pouvons partager 
                vos données avec des tiers uniquement dans les cas suivants :
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
                <li>Avec votre consentement explicite</li>
                <li>Pour traiter vos commandes (transporteurs, services de paiement)</li>
                <li>Pour respecter nos obligations légales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                6. Vos droits
              </h2>
              <p className="text-gray-600 mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Droit d&apos;accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit à l&apos;effacement</li>
                <li>Droit à la portabilité</li>
                <li>Droit d&apos;opposition</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                7. Contact
              </h2>
              <p className="text-gray-600">
                Pour toute question concernant cette politique de confidentialité ou 
                pour exercer vos droits, vous pouvez nous contacter à :
              </p>
              <p className="text-gray-600 mt-4">
                <strong>Email :</strong> privacy@youshop.com<br />
                <strong>Adresse :</strong> YouShop, 123 Rue du Commerce, 75001 Paris, France
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
