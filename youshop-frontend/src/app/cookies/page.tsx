'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CookiesPage() {
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
            Politique des Cookies
          </h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Dernière mise à jour : Janvier 2026
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Qu&apos;est-ce qu&apos;un cookie ?
              </h2>
              <p className="text-gray-600">
                Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, 
                tablette, smartphone) lors de la visite d&apos;un site web. Il permet au site 
                de mémoriser des informations sur votre visite, comme votre langue préférée 
                ou vos préférences d&apos;affichage.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. Types de cookies utilisés
              </h2>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">
                Cookies strictement nécessaires
              </h3>
              <p className="text-gray-600 mb-4">
                Ces cookies sont indispensables au fonctionnement du site. Ils vous permettent 
                d&apos;utiliser les principales fonctionnalités du site (panier, connexion, etc.). 
                Sans ces cookies, vous ne pourriez pas utiliser notre site normalement.
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">
                Cookies de performance
              </h3>
              <p className="text-gray-600 mb-4">
                Ces cookies collectent des informations sur la façon dont les visiteurs 
                utilisent notre site (pages visitées, erreurs rencontrées). Ces données 
                nous aident à améliorer le fonctionnement du site.
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">
                Cookies de fonctionnalité
              </h3>
              <p className="text-gray-600 mb-4">
                Ces cookies permettent de mémoriser vos choix (nom d&apos;utilisateur, langue, 
                région) pour vous offrir une expérience personnalisée.
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">
                Cookies publicitaires
              </h3>
              <p className="text-gray-600">
                Ces cookies sont utilisés pour vous proposer des publicités pertinentes 
                en fonction de vos centres d&apos;intérêt. Ils permettent également de limiter 
                le nombre de fois où vous voyez une publicité.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. Liste des cookies utilisés
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Nom</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Durée</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Finalité</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-600">session_id</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Nécessaire</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Session</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Authentification utilisateur</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-600">cart</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Nécessaire</td>
                      <td className="px-4 py-3 text-sm text-gray-600">7 jours</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Sauvegarde du panier</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-600">_ga</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Performance</td>
                      <td className="px-4 py-3 text-sm text-gray-600">2 ans</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Google Analytics</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-600">preferences</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Fonctionnalité</td>
                      <td className="px-4 py-3 text-sm text-gray-600">1 an</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Préférences utilisateur</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                4. Gestion des cookies
              </h2>
              <p className="text-gray-600 mb-4">
                Vous pouvez à tout moment choisir d&apos;accepter ou de refuser les cookies. 
                Lors de votre première visite, un bandeau vous informe de l&apos;utilisation 
                des cookies et vous permet de paramétrer vos préférences.
              </p>
              <p className="text-gray-600 mb-4">
                Vous pouvez également configurer votre navigateur pour accepter ou refuser 
                les cookies. Voici les liens vers les pages d&apos;aide des principaux navigateurs :
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>
                  <a href="https://support.google.com/chrome/answer/95647" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-primary hover:underline">
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a href="https://support.mozilla.org/fr/kb/cookies-informations-sites-enregistrent" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-primary hover:underline">
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-primary hover:underline">
                    Safari
                  </a>
                </li>
                <li>
                  <a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-primary hover:underline">
                    Microsoft Edge
                  </a>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                5. Conséquences du refus des cookies
              </h2>
              <p className="text-gray-600">
                Si vous choisissez de refuser les cookies, certaines fonctionnalités du 
                site pourraient ne pas fonctionner correctement. Par exemple, vous pourriez 
                avoir à vous reconnecter à chaque visite ou votre panier pourrait ne pas 
                être sauvegardé entre vos sessions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                6. Contact
              </h2>
              <p className="text-gray-600">
                Pour toute question concernant notre politique des cookies :
              </p>
              <p className="text-gray-600 mt-4">
                <strong>Email :</strong> privacy@youshop.com<br />
                <strong>Adresse :</strong> YouShop SAS, 123 Rue du Commerce, 75001 Paris, France
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
