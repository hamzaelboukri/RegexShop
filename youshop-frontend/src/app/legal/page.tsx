'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LegalPage() {
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
            Mentions Légales
          </h1>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Éditeur du site
              </h2>
              <p className="text-gray-600">
                Le site youshop.com est édité par :<br /><br />
                <strong>YouShop SAS</strong><br />
                Capital social : 10 000 €<br />
                Siège social : 123 Rue du Commerce, 75001 Paris, France<br />
                RCS Paris : XXX XXX XXX<br />
                N° TVA intracommunautaire : FR XX XXX XXX XXX<br />
                Email : contact@youshop.com<br />
                Téléphone : +33 1 XX XX XX XX
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. Directeur de la publication
              </h2>
              <p className="text-gray-600">
                Le directeur de la publication du site youshop.com est M./Mme [Nom du directeur], 
                en qualité de Président de YouShop SAS.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. Hébergeur
              </h2>
              <p className="text-gray-600">
                Le site est hébergé par :<br /><br />
                <strong>Vercel Inc.</strong><br />
                340 S Lemon Ave #4133<br />
                Walnut, CA 91789, États-Unis<br />
                Site web : vercel.com
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                4. Propriété intellectuelle
              </h2>
              <p className="text-gray-600">
                L&apos;ensemble du contenu du site youshop.com (textes, images, vidéos, logos, 
                graphismes, icônes, etc.) est la propriété exclusive de YouShop SAS ou de 
                ses partenaires. Toute reproduction, représentation, modification, publication 
                ou adaptation de tout ou partie des éléments du site, quel que soit le moyen 
                ou le procédé utilisé, est interdite sans autorisation écrite préalable de 
                YouShop SAS.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                5. Données personnelles
              </h2>
              <p className="text-gray-600">
                Les informations collectées sur ce site sont traitées conformément au 
                Règlement Général sur la Protection des Données (RGPD). Pour plus 
                d&apos;informations sur le traitement de vos données personnelles, veuillez 
                consulter notre <Link href="/privacy" className="text-primary hover:underline">
                Politique de Confidentialité</Link>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                6. Cookies
              </h2>
              <p className="text-gray-600">
                Le site youshop.com utilise des cookies pour améliorer l&apos;expérience 
                utilisateur. Pour plus d&apos;informations sur l&apos;utilisation des cookies, 
                veuillez consulter notre <Link href="/cookies" className="text-primary hover:underline">
                Politique des Cookies</Link>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                7. Liens hypertextes
              </h2>
              <p className="text-gray-600">
                Le site youshop.com peut contenir des liens vers d&apos;autres sites web. 
                YouShop SAS n&apos;exerce aucun contrôle sur ces sites et décline toute 
                responsabilité quant à leur contenu ou à leur politique de confidentialité.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                8. Droit applicable
              </h2>
              <p className="text-gray-600">
                Les présentes mentions légales sont régies par le droit français. 
                En cas de litige, les tribunaux français seront seuls compétents.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                9. Contact
              </h2>
              <p className="text-gray-600">
                Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
              </p>
              <p className="text-gray-600 mt-4">
                <strong>Email :</strong> legal@youshop.com<br />
                <strong>Adresse :</strong> YouShop SAS, 123 Rue du Commerce, 75001 Paris, France
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
