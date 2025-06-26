import DerrumbadaIllustrationSrc from '@/assets/derrumbada.svg?react';
import SolaIllustrationSrc from '@/assets/sola.svg?react';
import EstancadaIllustration from '@/assets/estancada.svg?react';
import DescansoIllustrationSrc from '@/assets/descanso.svg?react';
import CreatividadIllustrationSrc from '@/assets/creatividad.svg?react';
import RelajacionIllustrationSrc from '@/assets/relajacion.svg?react';
import EnojoIllustrationSrc from '@/assets/enojo.svg?react';
import TristezaIllustrationSrc from '@/assets/tristeza.svg?react';
import AnsiedadIllustrationSrc from '@/assets/ansiedad.svg?react';
export const botiquinCategories = [
    {
        id: 'ansiedad',
        title: 'Ansiedad / Angustia',
        illustrationComponent: AnsiedadIllustrationSrc,
        accentColorClass: 'border-fuchsia-100',
        backgroundColorClass: 'bg-fuchsia-50/20',
        activitiesCount: 9,
        textColorClass: 'text-fuchsia-500/80',
        titleHoverColorClass: 'group-hover:text-fuchsia-500 dark:group-hover:text-white',
        description: 'La ansiedad es cuando sientes preocupación excesiva por el futuro o sucesos que aún no pasan.'
    },
    {
        id: 'tristeza',
        title: 'Tristeza / Cansancio',
        illustrationComponent: TristezaIllustrationSrc,
        accentColorClass: 'border-teal-100',
        backgroundColorClass: 'bg-teal-50/20',
        activitiesCount: 3,
        textColorClass: 'text-teal-500/80',
        titleHoverColorClass: 'group-hover:text-teal-500 dark:group-hover:text-white',
        description: 'Hemos agrupado la tristeza y el cansancio porque tienen en común que haya una falta de energía'
    },
    {
        id: 'enojo',
        title: 'Enojo / Frustración',
        illustrationComponent: EnojoIllustrationSrc,
        accentColorClass: 'border-red-100',
        backgroundColorClass: 'bg-red-50/20',
        textColorClass: 'text-red-500/80',
        activitiesCount: 10,
        titleHoverColorClass: 'group-hover:text-red-500 dark:group-hover:text-white',
        description: 'Exercitation labore eiusmod officia reprehenderit enim sit. '
    },
    {
        id: 'descanso',
        title: 'Necesito Descansar / Pausa',
        illustrationComponent: DescansoIllustrationSrc,
        accentColorClass: 'border-indigo-100',
        backgroundColorClass: 'bg-indigo-50/20',
        activitiesCount: 15,
        textColorClass: 'text-indigo-500/80',
        titleHoverColorClass: 'group-hover:text-indigo-500 dark:group-hover:text-white',
        description: 'Eu do tempor consequat do pariatur laborum voluptate nostrud incididunt excepteur esse velit.'
    },
    {
        id: 'relajacion',
        title: 'Quiero Relajarme',
        illustrationComponent: RelajacionIllustrationSrc,
        accentColorClass: 'border-orange-100',
        backgroundColorClass: 'bg-orange-50/20',
        activitiesCount: 12,
        textColorClass: 'text-orange-500/80',
        titleHoverColorClass: 'group-hover:text-orange-500 dark:group-hover:text-white',
        description: 'Nisi est in qui reprehenderit amet ex do irure non nostrud.'
    },
    {
        id: 'creatividad',
        title: 'Bloqueo / Pausa Creativa',
        illustrationComponent: CreatividadIllustrationSrc,
        accentColorClass: 'border-stone-100',
        backgroundColorClass: 'bg-stone-50/20',
        activitiesCount: 8,
        textColorClass: 'text-stone-500/80',
        titleHoverColorClass: 'group-hover:text-stone-500 dark:group-hover:text-white',
        description: 'Mollit dolor qui reprehenderit commodo irure pariatur commodo do.'
    },
    {
        id: 'derrumbada',
        title: 'Me siento Derrumbada',
        illustrationComponent: DerrumbadaIllustrationSrc,
        accentColorClass: 'border-lime-100',
        backgroundColorClass: 'bg-lime-50/20',
        activitiesCount: 20,
        textColorClass: 'text-lime-500/80',
        titleHoverColorClass: 'group-hover:text-lime-500 dark:group-hover:text-white',
        description: 'Ea ea proident mollit velit in dolor ut incididunt deserunt dolor ex.'
    },
    {
        id: 'sola',
        title: 'Me siento Sola',
        illustrationComponent: SolaIllustrationSrc,
        accentColorClass: 'border-pink-100',
        backgroundColorClass: 'bg-pink-50/20',
        activitiesCount: 5,
        textColorClass: 'text-pink-500/80',
        titleHoverColorClass: 'group-hover:text-pink-500 dark:group-hover:text-white',
        description: 'Sint commodo sunt laborum tempor.'
    },
    {
        id: 'estancada',
        title: 'Me siento Estancada',
        illustrationComponent: EstancadaIllustration,
        accentColorClass: 'border-slate-100',
        backgroundColorClass: 'bg-slate-100/20',
        activitiesCount: 4,
        textColorClass: 'text-slate-500/80',
        titleHoverColorClass: 'group-hover:text-slate-500 dark:group-hover:text-white',
        description: 'Quis consectetur cillum pariatur eiusmod qui pariatur exercitation est.'
    },
];
