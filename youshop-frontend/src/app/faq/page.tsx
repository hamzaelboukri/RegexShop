'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp, Search } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: 'Commandes',
    question: 'Comment passer une commande ?',
    answer: 'Pour passer une commande, parcourez notre catalogue, ajoutez les articles souhaités à votre panier, puis cliquez sur "Commander". Vous serez guidé à travers le processus de paiement sécurisé.',
  },
  {
    category: 'Commandes',
    question: 'Comment suivre ma commande ?',
    answer: 'Une fois votre commande expédiée, vous recevrez un email avec un numéro de suivi. Vous pouvez également suivre votre commande dans la section "Mes commandes" de votre compte.',
  },
  {
    category: 'Commandes',
    question: 'Puis-je modifier ou annuler ma commande ?',
    answer: 'Vous pouvez modifier ou annuler votre commande dans l\'heure suivant sa validation. Au-delà, contactez notre service client qui fera son possible pour vous aider.',
  },
  {
    category: 'Livraison',
    question: 'Quels sont les délais de livraison ?',
    answer: 'La livraison standard prend 3 à 5 jours ouvrés. La livraison express est disponible en 1 à 2 jours ouvrés pour un supplément. Les délais peuvent varier selon votre localisation.',
  },
  {
    category: 'Livraison',
    question: 'Quels sont les frais de livraison ?',
    answer: 'La livraison est gratuite pour toute commande supérieure à 50€. En dessous, les frais sont de 4,99€ pour la livraison standard et 9,99€ pour la livraison express.',
  },
  {
    category: 'Livraison',
    question: 'Livrez-vous à l\'international ?',
    answer: 'Actuellement, nous livrons en France métropolitaine, en Belgique, en Suisse et au Luxembourg. D\'autres destinations seront bientôt disponibles.',
  },
  {
    category: 'Retours',
    question: 'Comment retourner un article ?',
    answer: 'Vous disposez de 14 jours après réception pour retourner un article. Connectez-vous à votre compte, allez dans "Mes commandes" et sélectionnez "Demander un retour". Imprimez l\'étiquette de retour et déposez votre colis en point relais.',
  },
  {
    category: 'Retours',
    question: 'Combien de temps pour être remboursé ?',
    answer: 'Le remboursement est effectué sous 14 jours après réception et vérification de votre retour. Le montant sera crédité sur le moyen de paiement utilisé lors de l\'achat.',
  },
  {
    category: 'Retours',
    question: 'Les frais de retour sont-ils gratuits ?',
    answer: 'Les retours sont gratuits pour les articles défectueux ou non conformes. Pour les retours par convenance personnelle, les frais de retour sont à votre charge (environ 4,99€).',
  },
  {
    category: 'Paiement',
    question: 'Quels moyens de paiement acceptez-vous ?',
    answer: 'Nous acceptons les cartes bancaires (Visa, MasterCard, American Express), PayPal et Apple Pay. Tous les paiements sont sécurisés par Stripe.',
  },
  {
    category: 'Paiement',
    question: 'Mon paiement est-il sécurisé ?',
    answer: 'Oui, tous nos paiements sont sécurisés via Stripe, leader mondial du paiement en ligne. Vos données bancaires ne sont jamais stockées sur nos serveurs.',
  },
  {
    category: 'Compte',
    question: 'Comment créer un compte ?',
    answer: 'Cliquez sur "Connexion" puis "Créer un compte". Remplissez le formulaire avec vos informations et validez. Vous recevrez un email de confirmation.',
  },
  {
    category: 'Compte',
    question: 'J\'ai oublié mon mot de passe, que faire ?',
    answer: 'Sur la page de connexion, cliquez sur "Mot de passe oublié". Entrez votre email et vous recevrez un lien pour réinitialiser votre mot de passe.',
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(faqData.map(item => item.category)));

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

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
            Foire Aux Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trouvez rapidement les réponses à vos questions les plus fréquentes.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une question..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory 
                ? 'bg-primary text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Toutes
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQ.length > 0 ? (
            filteredFAQ.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <span className="text-xs font-medium text-primary uppercase tracking-wide">
                      {item.category}
                    </span>
                    <h3 className="text-gray-900 font-medium mt-1">
                      {item.question}
                    </h3>
                  </div>
                  {openItems.includes(index) ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openItems.includes(index) && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune question ne correspond à votre recherche.</p>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Vous n&apos;avez pas trouvé votre réponse ?
          </h2>
          <p className="text-gray-600 mb-4">
            Notre équipe est disponible pour vous aider.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Contactez-nous
          </Link>
        </div>
      </div>
    </div>
  );
}
