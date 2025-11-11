// app/cgu-confidentialite/page.tsx
// Terms of Service (CGU) & Privacy Policy (Confidentialité) for a course exchange marketplace

import React from "react";
import Link from "next/link";

export const metadata = {
  title: "CGU & Confidentialité | Studxus",
  description:
    "Conditions Générales d’Utilisation et Politique de Confidentialité pour la plateforme d’échange et d’offre de cours.",
};

// —— Customize these brand constants ——
const BRAND = {
  siteName: "Studxus", // ← change to your website name
  companyName: "Studxus SASU", // or association
  contactEmail: "contact@studxus.com", // legal contact
  dpoEmail: "dpo@studxus.com", // data protection officer
  companyAddress: "10 rue Exemple, 69007 Lyon, France",
  platformRole: "mise en relation" as const, // broker/marketplace role
  commissionRate: 0.12, // 12% marketplace fee (example)
};

function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="scroll-mt-28 text-xl sm:text-2xl font-semibold tracking-tight"
    >
      <a href={`#${id}`} className="no-underline hover:underline">
        {children}
      </a>
    </h2>
  );
}

function SubHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h3 id={id} className="scroll-mt-28 text-lg sm:text-xl font-semibold">
      <a href={`#${id}`} className="no-underline hover:underline">
        {children}
      </a>
    </h3>
  );
}

export default function CGUConfidentialitePage() {
  const lastUpdated = "11 novembre 2025"; // keep this current when you update
  const commissionPct = Math.round(BRAND.commissionRate * 100);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14 prose prose-neutral dark:prose-invert">
      <header className="not-prose border-b pb-6 mb-8">
        <p className="text-sm text-gray-500">
          Dernière mise à jour : {lastUpdated}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold">
          CGU & Politique de Confidentialité
        </h1>
        <p className="mt-2 text-gray-600">
          Bienvenue sur {BRAND.siteName}. Ces Conditions Générales d’Utilisation
          (les « CGU ») et cette Politique de Confidentialité s’appliquent à
          toute utilisation de la plateforme permettant aux étudiants de
          proposer, réserver et payer des cours.
        </p>
      </header>

      <nav
        aria-label="Sommaire"
        className="not-prose bg-gray-50  border rounded-xl p-4 mb-8"
      >
        <p className="font-medium mb-2">Sommaire</p>
        <ul className="grid gap-1 text-sm sm:grid-cols-2 list-disc pl-5">
          <li>
            <a href="#definitions">Définitions</a>
          </li>
          <li>
            <a href="#objet">Objet et Champ d’application</a>
          </li>
          <li>
            <a href="#compte">Création de compte</a>
          </li>
          <li>
            <a href="#role">Rôle de la plateforme</a>
          </li>
          <li>
            <a href="#conduite">Conduite & Contenus</a>
          </li>
          <li>
            <a href="#reservations">Réservations, prix & paiements</a>
          </li>
          <li>
            <a href="#annulations">Annulations & remboursements</a>
          </li>
          <li>
            <a href="#avis">Notes & avis</a>
          </li>
          <li>
            <a href="#propriete-intellectuelle">Propriété intellectuelle</a>
          </li>
          <li>
            <a href="#responsabilite">Responsabilité</a>
          </li>
          <li>
            <a href="#suspension">Suspension & résiliation</a>
          </li>
          <li>
            <a href="#droit-applicable">Droit applicable</a>
          </li>
          <li>
            <a href="#donnees">Données personnelles</a>
          </li>
          <li>
            <a href="#cookies">Cookies</a>
          </li>
          <li>
            <a href="#droits-rgpd">Vos droits RGPD</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
        </ul>
      </nav>

      {/* CGU */}
      <SectionHeading id="definitions">1. Définitions</SectionHeading>
      <p>
        « <strong>Offreur</strong> » : étudiant proposant un cours sur la
        plateforme. « <strong>Apprenant</strong> » : étudiant réservant un
        cours. « <strong>Annonce</strong> » : page de présentation d’un cours.
        « <strong>Frais de service</strong> » : commission de {commissionPct}%
        prélevée par {BRAND.siteName} sur les montants payés par l’Apprenant
        (hors frais de paiement). « <strong>Session</strong> » : occurrence d’un
        cours (date/heure/durée).
      </p>

      <SectionHeading id="objet">
        2. Objet et Champ d’application
      </SectionHeading>
      <p>
        Les présentes CGU régissent l’accès et l’utilisation de {BRAND.siteName}
        , édité par {BRAND.companyName} ({BRAND.companyAddress}). Elles
        s’appliquent à toute navigation, création d’Annonce, réservation et
        paiement.
      </p>

      <SectionHeading id="compte">
        3. Création de compte & éligibilité
      </SectionHeading>
      <ul>
        <li>
          Être âgé d’au moins 16 ans. Les mineurs restent sous la responsabilité
          de leur représentant légal.
        </li>
        <li>
          Fournir des informations exactes et les maintenir à jour ; un seul
          compte par personne.
        </li>
        <li>
          Vous êtes responsable de la confidentialité de vos identifiants et de
          l’activité réalisée via votre compte.
        </li>
      </ul>

      <SectionHeading id="role">4. Rôle de la plateforme</SectionHeading>
      <p>
        {BRAND.siteName} est une plateforme de {BRAND.platformRole}. Nous ne
        dispensons pas nous‑mêmes les cours. Les Offreurs sont seuls
        responsables du contenu, du déroulé et de la conformité des cours.{" "}
        {BRAND.siteName} peut proposer des outils de planification, de
        messagerie, de paiement et de résolution de litiges.
      </p>

      <SectionHeading id="conduite">
        5. Conduite, sécurité & contenus
      </SectionHeading>
      <ul>
        <li>
          Respect et non‑discrimination ; aucun contenu illégal, diffamatoire,
          violent ou portant atteinte aux droits d’auteur.
        </li>
        <li>
          Les cours doivent respecter la réglementation applicable (ex.
          sécurité, droits d’auteur sur supports partagés).
        </li>
        <li>
          Nous pouvons retirer tout contenu ou suspendre un compte en cas de
          violation.
        </li>
      </ul>

      <SectionHeading id="reservations">
        6. Réservations, prix, facturation & paiements
      </SectionHeading>
      <ul>
        <li>
          Les Offreurs fixent librement le prix par session ou par heure. Les
          prix affichés incluent les taxes applicables le cas échéant.
        </li>
        <li>
          Lors d’une réservation, l’Apprenant autorise le débit du montant du
          cours, auquel s’ajoutent les frais de service de {commissionPct}% et
          d’éventuels frais de paiement.
        </li>
        <li>
          Après la tenue de la session (ou passé un délai de confirmation), le
          montant net est reversé à l’Offreur, déduction faite des frais.
        </li>
        <li>
          Les Offreurs doivent fournir les informations nécessaires à la
          facturation (nom, adresse, n° de TVA le cas échéant). Des factures
          sont mises à disposition.
        </li>
        <li>
          Les paiements sont opérés par un prestataire tiers (PSP). Des
          vérifications d’identité (KYC) peuvent être requises.
        </li>
      </ul>

      <SectionHeading id="annulations">
        7. Annulations & remboursements
      </SectionHeading>
      <p>Par défaut (sauf politique spécifique de l’Annonce) :</p>
      <ul>
        <li>
          Annulation par l’Apprenant ≥ 24h avant la session : remboursement
          intégral (hors frais non remboursables du PSP, le cas échéant).
        </li>
        <li>
          Annulation par l’Apprenant &lt; 24h : pas de remboursement, sauf cas
          de force majeure documenté.
        </li>
        <li>
          Annulation par l’Offreur : remboursement intégral à l’Apprenant ;
          l’Offreur ne perçoit aucun versement.
        </li>
        <li>No‑show Apprenant : non remboursé. No‑show Offreur : remboursé.</li>
      </ul>
      <p>
        Le délai et le mode de remboursement dépendent du PSP et de la méthode
        de paiement.
      </p>

      <SectionHeading id="avis">8. Notes & avis</SectionHeading>
      <p>
        Les Apprenants peuvent laisser une note et un avis honnête après une
        session. Les avis doivent reposer sur une expérience réelle et respecter
        la charte de conduite. Nous pouvons modérer ou retirer les avis abusifs.
      </p>

      <SectionHeading id="propriete-intellectuelle">
        9. Propriété intellectuelle
      </SectionHeading>
      <ul>
        <li>
          Les Offreurs doivent détenir les droits nécessaires sur les supports
          (cours, documents, vidéos). Aucun partage non autorisé.
        </li>
        <li>
          En publiant sur la plateforme, vous concédez à {BRAND.siteName} une
          licence mondiale, non exclusive et gratuite pour héberger, reproduire
          et afficher vos contenus aux seules fins d’exploitation de la
          plateforme.
        </li>
        <li>
          Les marques, logos et éléments de {BRAND.siteName} restent la
          propriété de {BRAND.companyName}.
        </li>
      </ul>

      <SectionHeading id="responsabilite">
        10. Limitation de responsabilité
      </SectionHeading>
      <p>
        {BRAND.siteName} n’est pas responsable des performances pédagogiques, de
        l’adéquation d’un cours à un objectif particulier ni des interactions
        hors plateforme. Dans la limite permise par la loi, toute responsabilité
        indirecte ou dommage consécutif est exclu.
      </p>

      <SectionHeading id="suspension">
        11. Suspension, résiliation & sanctions
      </SectionHeading>
      <p>
        Nous pouvons suspendre ou résilier un compte en cas de fraude,
        non‑respect des CGU, atteinte à la sécurité ou demande d’une autorité.
        Les sommes indûment perçues pourront être retenues ou restituées.
      </p>

      <SectionHeading id="droit-applicable">
        12. Droit applicable & litiges
      </SectionHeading>
      <p>
        Les CGU sont régies par le droit français. À défaut d’accord amiable ou
        de médiation, les tribunaux compétents du ressort de Lyon seront saisis.
      </p>

      {/* Confidentialité */}
      <SectionHeading id="donnees">13. Confidentialité (RGPD)</SectionHeading>
      <SubHeading id="responsable-traitement">
        13.1 Responsable de traitement
      </SubHeading>
      <p>
        {BRAND.companyName}, {BRAND.companyAddress}, est responsable du
        traitement des données personnelles collectées via {BRAND.siteName}.
        Contact : <a href={`mailto:${BRAND.dpoEmail}`}>{BRAND.dpoEmail}</a>.
      </p>

      <SubHeading id="donnees-collectees">13.2 Données collectées</SubHeading>
      <ul>
        <li>
          Identité : nom, prénom, pseudo, photo, âge (indication 16+), pièces
          KYC pour Offreurs si requis.
        </li>
        <li>Contact : email, téléphone (optionnel).</li>
        <li>
          Profil & contenu : bio, compétences, intérêts, annonces, messages.
        </li>
        <li>
          Transactions : réservations, montants, factures, IBAN/compte via PSP
          (non stockés par {BRAND.siteName}).
        </li>
        <li>
          Technique : logs, identifiants de session, appareil, IP,
          cookies/trackers.
        </li>
        <li>Support : demandes et échanges avec l’assistance.</li>
      </ul>

      <SubHeading id="finalites-bases">
        13.3 Finalités & bases légales
      </SubHeading>
      <ul>
        <li>
          Fourniture du service (exécution du contrat) : comptes, annonces,
          réservations, paiements.
        </li>
        <li>
          Sécurité et prévention de la fraude (intérêt légitime / obligation
          légale).
        </li>
        <li>
          Amélioration produit & statistiques agrégées (intérêt légitime).
        </li>
        <li>
          Prospection email limitée (consentement) : vous pouvez retirer votre
          consentement à tout moment.
        </li>
        <li>Obligations comptables et fiscales (obligation légale).</li>
      </ul>

      <SubHeading id="destinataires">
        13.4 Destinataires et transferts
      </SubHeading>
      <p>
        Données partagées avec : prestataire de paiement (PSP),
        hébergeur/stockage, outil d’emailing, analytics, prestataires KYC,
        support. Des transferts hors UE peuvent exister ; le cas échéant, nous
        appliquons des garanties appropriées (clauses contractuelles types de la
        Commission européenne).
      </p>

      <SubHeading id="duree">13.5 Durées de conservation</SubHeading>
      <ul>
        <li>
          Compte : durée d’utilisation + 3 ans après la dernière activité
          (archivage intermédiaire).
        </li>
        <li>Transactions/facturation : 10 ans (obligation légale).</li>
        <li>Logs de sécurité : 6 à 12 mois.</li>
        <li>Prospection : 3 ans à compter du dernier contact.</li>
      </ul>

      <SubHeading id="securite">13.6 Sécurité</SubHeading>
      <p>
        Mesures techniques et organisationnelles raisonnables (chiffrement en
        transit, contrôle d’accès, journalisation). Aucun système n’étant
        infaillible, nous vous invitons à conserver des mots de passe robustes
        et uniques.
      </p>

      <SectionHeading id="cookies">14. Cookies & traceurs</SectionHeading>
      <p>
        Nous utilisons des cookies nécessaires au fonctionnement du site et,
        avec votre consentement, des cookies de mesure d’audience et de
        personnalisation. Vous pouvez gérer vos préférences via un bandeau de
        consentement et dans les paramètres de votre navigateur.
      </p>

      <SectionHeading id="droits-rgpd">15. Vos droits (RGPD)</SectionHeading>
      <ul>
        <li>
          Accès, rectification, effacement, limitation, portabilité, opposition.
        </li>
        <li>
          Retrait du consentement à tout moment pour les traitements fondés sur
          le consentement.
        </li>
        <li>
          Exercer vos droits en écrivant à{" "}
          <a href={`mailto:${BRAND.dpoEmail}`}>{BRAND.dpoEmail}</a> ; nous
          pouvons vérifier votre identité.
        </li>
        <li>
          Réclamation auprès de la CNIL :{" "}
          <a href="https://www.cnil.fr/" target="_blank" rel="noreferrer">
            cnil.fr
          </a>
          .
        </li>
      </ul>

      <SectionHeading id="minors">16. Mineurs</SectionHeading>
      <p>
        L’utilisation du service est interdite aux moins de 16 ans. Les mineurs
        entre 16 et 18 ans doivent disposer de l’autorisation de leur
        représentant légal.
      </p>

      <SectionHeading id="modifs">17. Modifications</SectionHeading>
      <p>
        Nous pouvons modifier ces documents pour des raisons légales, techniques
        ou opérationnelles. En cas de changement matériel, nous vous informerons
        par email ou via une notification sur le site. La poursuite de
        l’utilisation après entrée en vigueur vaut acceptation.
      </p>

      <SectionHeading id="contact">18. Contact</SectionHeading>
      <address className="not-italic">
        {BRAND.companyName}
        <br />
        {BRAND.companyAddress}
        <br />
        Email juridique :{" "}
        <a href={`mailto:${BRAND.contactEmail}`}>{BRAND.contactEmail}</a>
        <br />
        DPO : <a href={`mailto:${BRAND.dpoEmail}`}>{BRAND.dpoEmail}</a>
      </address>

      <hr className="my-10" />
      <p className="text-sm text-gray-500">
        Ce modèle est fourni à titre indicatif et ne constitue pas un conseil
        juridique. Faites relire vos CGU/Confidentialité par un professionnel.
      </p>

      <div className="not-prose mt-6 flex gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          Retour à l’accueil
        </Link>
        <a
          href="#top"
          className="inline-flex items-center rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          Haut de page
        </a>
      </div>
    </main>
  );
}
