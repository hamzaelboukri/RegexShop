'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
            Conditions Générales de Vente
          </h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Dernière mise à jour : Janvier 2026
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Objet
              </h2>
              <p className="text-gray-600">
                Les présentes Conditions Générales de Vente (CGV) régissent les relations 
                contractuelles entre YouShop et ses clients dans le cadre de la vente 
                de produits sur le site youshop.com.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. Prix
              </h2>
              <p className="text-gray-600">
                Les prix de nos produits sont indiqués en euros toutes taxes comprises (TTC), 
                hors frais de livraison. YouShop se réserve le droit de modifier ses prix 
                à tout moment, mais les produits seront facturés sur la base des tarifs 
                en vigueur au moment de la validation de la commande.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. Commande
              </h2>
              <p className="text-gray-600 mb-4">
                Le client passe commande sur le site Internet youshop.com. La validation 
                de la commande implique l&apos;acceptation des présentes CGV. Un email de 
                confirmation est envoyé au client après validation de la commande.
              </p>
              <p className="text-gray-600">
                YouShop se réserve le droit d&apos;annuler ou de refuser toute commande 
                d&apos;un client avec lequel il existerait un litige relatif au paiement 
                d&apos;une commande antérieure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                4. Paiement
              </h2>
              <p className="text-gray-600">
                Le paiement s&apos;effectue en ligne par carte bancaire via notre prestataire 
                de paiement sécurisé Stripe. Les cartes acceptées sont : Visa, MasterCard, 
                American Express. Le débit de la carte est effectué au moment de la 
                validation de la commande.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                5. Livraison
              </h2>
              <p className="text-gray-600 mb-4">
                Les produits sont livrés à l&apos;adresse indiquée par le client lors de 
                la commande. Les délais de livraison sont donnés à titre indicatif :
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Livraison standard : 3 à 5 jours ouvrés</li>
                <li>Livraison express : 1 à 2 jours ouvrés</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                6. Droit de rétractation
              </h2>
              <p className="text-gray-600">
                Conformément aux dispositions légales en vigueur, le client dispose 
                d&apos;un délai de 14 jours à compter de la réception des produits pour 
                exercer son droit de rétractation sans avoir à justifier de motifs 
                ni à payer de pénalités.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                7. Garanties
              </h2>
              <p className="text-gray-600">
                Tous nos produits bénéficient de la garantie légale de conformité 
                (articles L.217-4 et suivants du Code de la consommation) et de la 
                garantie contre les vices cachés (articles 1641 et suivants du Code civil).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                8. Responsabilité
              </h2>
              <p className="text-gray-600">
                YouShop ne saurait être tenu responsable des dommages indirects pouvant 
                survenir du fait de l&apos;achat des produits. La responsabilité de YouShop 
                est limitée au montant de la commande.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                9. Litiges
              </h2>
              <p className="text-gray-600">
                Les présentes CGV sont soumises au droit français. En cas de litige, 
                une solution amiable sera recherchée avant toute action judiciaire. 
                À défaut, les tribunaux français seront seuls compétents.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                10. Contact
              </h2>
              <p className="text-gray-600">
                Pour toute question concernant ces CGV, vous pouvez nous contacter :
              </p>
              <p className="text-gray-600 mt-4">
                <strong>Email :</strong> contact@youshop.com<br />
                <strong>Adresse :</strong> YouShop, 123 Rue du Commerce, 75001 Paris, France
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
