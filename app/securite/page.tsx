// app/securite/page.tsx
// Page Sécurité pour une plateforme d'échange/offre de cours entre étudiants

import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Sécurité | Studxus Cours",
  description:
    "Mesures de sécurité, bonnes pratiques et procédure de divulgation responsable pour la plateforme de cours.",
};

// —— Personnalisez ces constantes ——
const BRAND = {
  siteName: "Studxus Cours",
  companyName: "Studxus SASU",
  contactEmail: "security@studxus.example",
  dpoEmail: "dpo@studxus.example",
  companyAddress: "10 rue Exemple, 69007 Lyon, France",
  statusUrl: "https://status.example.com", // remplacez par votre page de statut
};

function H2({ id, children }: { id: string; children: React.ReactNode }) {
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

// function H3({ id, children }: { id: string; children: React.ReactNode }) {
//   return (
//     <h3 id={id} className="scroll-mt-28 text-lg sm:text-xl font-semibold">
//       <a href={`#${id}`} className="no-underline hover:underline">
//         {children}
//       </a>
//     </h3>
//   );
// }

export default function SecurityPage() {
  const lastUpdated = "11 novembre 2025";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14 prose prose-neutral dark:prose-invert">
      <header className="not-prose border-b pb-6 mb-8">
        <p className="text-sm text-gray-500">
          Dernière mise à jour : {lastUpdated}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold">Sécurité</h1>
        <p className="mt-2 text-gray-600">
          Chez {BRAND.siteName}, la sécurité de vos données et des paiements est
          une priorité. Cette page décrit nos mesures techniques et
          organisationnelles, ainsi que nos engagements de divulgation
          responsable.
        </p>
      </header>

      <nav
        aria-label="Sommaire"
        className="not-prose border rounded-xl p-4 mb-8"
      >
        <p className="font-medium mb-2">Sommaire</p>
        <ul className="grid gap-1 text-sm sm:grid-cols-2 list-disc pl-5">
          <li>
            <a href="#principes">Principes</a>
          </li>
          <li>
            <a href="#infra">Sécurité infrastructure</a>
          </li>
          <li>
            <a href="#appsec">Sécurité applicative</a>
          </li>
          <li>
            <a href="#paiements">Paiements & KYC</a>
          </li>
          <li>
            <a href="#comptes">Sécurité des comptes</a>
          </li>
          <li>
            <a href="#donnees">Protection des données</a>
          </li>
          <li>
            <a href="#journaux">Logs & surveillance</a>
          </li>
          <li>
            <a href="#sauvegardes">Sauvegardes & reprise</a>
          </li>
          <li>
            <a href="#incident">Gestion d’incident</a>
          </li>
          <li>
            <a href="#divulgation">Divulgation responsable</a>
          </li>
          <li>
            <a href="#bonnes-pratiques">Bonnes pratiques utilisateurs</a>
          </li>
          <li>
            <a href="#conformite">Conformité</a>
          </li>
          <li>
            <a href="#contact">Contact sécurité</a>
          </li>
        </ul>
      </nav>

      <H2 id="principes">1. Principes</H2>
      <ul>
        <li>
          Approche « sécurité dès la conception » (privacy-by-design,
          security-by-design).
        </li>
        <li>
          Principe du moindre privilège et séparation des environnements (dev /
          préprod / prod).
        </li>
        <li>
          Mises à jour régulières et correctifs de sécurité des dépendances.
        </li>
      </ul>

      <H2 id="infra">2. Sécurité infrastructure</H2>
      <ul>
        <li>
          Hébergement auprès de fournisseurs reconnus (data centers avec
          contrôle d’accès physique).
        </li>
        <li>
          Réseau : pare-feu gérés, groupes de sécurité restrictifs, ports
          minimaux exposés.
        </li>
        <li>
          Chiffrement en transit (TLS 1.2+) et chiffrement au repos pour les
          bases de données et backups.
        </li>
        <li>
          Gestion des secrets via coffre-fort (variables d’environnement,
          rotation périodique).
        </li>
        <li>
          Isolation des services (conteneurs ou fonctions managées) et scans
          d’images.
        </li>
      </ul>

      <H2 id="appsec">3. Sécurité applicative</H2>
      <ul>
        <li>
          Framework Next.js avec protections XSS/CSRF côté serveur et en-têtes
          de sécurité.
        </li>
        <li>
          Validation stricte des entrées (schémas), désérialisation sûre et
          sanitation des contenus.
        </li>
        <li>
          Protection contre injections SQL via ORM/driver paramétré + RLS côté
          base si applicable.
        </li>
        <li>
          Rate limiting et protections anti‑abus sur les endpoints sensibles
          (auth, paiement, messages).
        </li>
        <li>
          Tests automatisés et revues de code ; intégration continue avec
          analyses de vulnérabilités.
        </li>
        <li>
          Politique de dépendances : verrouillage de versions et audits
          réguliers.
        </li>
      </ul>

      <H2 id="paiements">4. Paiements & KYC</H2>
      <ul>
        <li>
          Paiements opérés par un prestataire de services de paiement (PSP)
          certifié (ex. PCI‑DSS).
        </li>
        <li>
          Les données de cartes ne transitent pas par {BRAND.siteName} ; nous
          utilisons des tokens fournis par le PSP.
        </li>
        <li>
          Vérifications d’identité (KYC) pour les Offreurs lorsque requis par le
          PSP/la loi.
        </li>
      </ul>

      <H2 id="comptes">5. Sécurité des comptes</H2>
      <ul>
        <li>
          Hachage robuste des mots de passe (algorithmes modernes, salage).
        </li>
        <li>
          Possibilité d’authentification multifacteur (2FA) si activée sur votre
          compte.
        </li>
        <li>
          Notifications d’activité sensible (nouvel appareil, changement
          d’email/mot de passe).
        </li>
        <li>
          Sessions : expiration et révocation à la demande (déconnexion de tous
          les appareils).
        </li>
      </ul>

      <H2 id="donnees">6. Protection des données</H2>
      <ul>
        <li>
          Minimisation : collecte limitée au strict nécessaire pour fournir le
          service.
        </li>
        <li>
          Contrôles d’accès basés sur les rôles (RBAC) et règles de sécurité
          côté base (ex. RLS).
        </li>
        <li>
          Pseudonymisation ou agrégation pour la mesure d’audience et les
          statistiques.
        </li>
        <li>
          Suppression et portabilité sur demande conformément à la Politique de
          Confidentialité.
        </li>
      </ul>

      <H2 id="journaux">7. Journaux & surveillance</H2>
      <ul>
        <li>
          Journalisation des événements de sécurité et d’accès administratif.
        </li>
        <li>
          Alertes basées sur des seuils anormaux (connexions, échecs répétés,
          rate limiting).
        </li>
        <li>
          Rétention limitée des logs de sécurité (6–12 mois) conformément au
          principe de minimisation.
        </li>
      </ul>

      <H2 id="sauvegardes">8. Sauvegardes & reprise après incident</H2>
      <ul>
        <li>Sauvegardes chiffrées et tests de restauration périodiques.</li>
        <li>
          Objectifs RPO/RTO raisonnables en fonction de la criticité des
          données.
        </li>
        <li>
          Plan de continuité d’activité pour les dépendances critiques (PSP,
          hébergeur).
        </li>
      </ul>

      <H2 id="incident">9. Gestion d’incident</H2>
      <ol>
        <li>
          Détection et qualification de l’incident (sécurité, disponibilité,
          intégrité).
        </li>
        <li>
          Confinement et éradication (révocation de secrets, patches, bascule
          d’infra).
        </li>
        <li>Restauration des services et vérifications post‑incident.</li>
        <li>
          Notification aux utilisateurs et aux autorités (CNIL) lorsque la loi
          l’exige.
        </li>
        <li>Post‑mortem documenté et mesures préventives.</li>
      </ol>

      <H2 id="divulgation">
        10. Divulgation responsable (Responsible Disclosure)
      </H2>
      <p>
        Si vous pensez avoir découvert une vulnérabilité, contactez‑nous en
        priorité à
        <a href={`mailto:${BRAND.contactEmail}`}> {BRAND.contactEmail}</a> avec
        les détails techniques nécessaires pour reproduire le problème. Merci
        de :
      </p>
      <ul>
        <li>
          Éviter tout impact sur la disponibilité et la confidentialité des
          données.
        </li>
        <li>
          Ne pas accéder, modifier, supprimer ni exfiltrer des données réelles.
        </li>
        <li>Vous abstenir de divulguer publiquement avant la correction.</li>
      </ul>
      <p>
        Nous confirmons la réception, évaluons la gravité et vous tenons informé
        des correctifs. Une reconnaissance peut être accordée en fonction de
        l’impact (pas de programme de bug bounty financier à ce stade, sauf
        mention contraire sur la page de statut).
      </p>

      <H2 id="bonnes-pratiques">11. Bonnes pratiques utilisateurs</H2>
      <ul>
        <li>
          Activez la 2FA si disponible et utilisez un mot de passe unique et
          robuste.
        </li>
        <li>
          Méfiez‑vous du phishing : vérifiez l’URL, ne partagez jamais votre mot
          de passe.
        </li>
        <li>
          Signalez tout comportement suspect ou contenu illicite via le bouton
          « Signaler ».
        </li>
        <li>Mettez à jour votre navigateur et votre système.</li>
      </ul>

      <H2 id="conformite">12. Conformité & statut</H2>
      <ul>
        <li>
          Conformité au RGPD décrite dans la Politique de Confidentialité.
        </li>
        <li>
          Le PSP gère la conformité PCI‑DSS. {BRAND.siteName} ne stocke pas de
          données de carte.
        </li>
        <li>
          Disponibilité : consultez notre page statut pour les incidents et la
          maintenance :{" "}
          <a href={BRAND.statusUrl} target="_blank" rel="noreferrer">
            Page de statut
          </a>
          .
        </li>
      </ul>

      <H2 id="contact">13. Contact sécurité</H2>
      <address className="not-italic">
        {BRAND.companyName}
        <br />
        {BRAND.companyAddress}
        <br />
        Email sécurité :{" "}
        <a href={`mailto:${BRAND.contactEmail}`}>{BRAND.contactEmail}</a>
        <br />
        DPO : <a href={`mailto:${BRAND.dpoEmail}`}>{BRAND.dpoEmail}</a>
      </address>

      <hr className="my-10" />
      <p className="text-sm text-gray-500">
        Cette page décrit nos pratiques en matière de sécurité mais ne constitue
        pas une garantie absolue. Tenez compte de nos CGU et de notre Politique
        de Confidentialité.
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
