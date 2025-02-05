"use client";

import { Table } from '@/app/components/layouts/table';

import { PencilIcon, MarkGithubIcon } from '@primer/octicons-react';

const columns = [
    { key: 'name', title: 'Nom', sortable: true },
    { key: 'email', title: 'Adresse e-mail universitaire', sortable: true },
    { key: 'role', title: 'Rôle', sortable: true },
    { key: 'promotions', title: 'Promotion(s)', sortable: true },
    { key: 'actions', title: 'Action(s)', sortable: false },
];

const data = [
    { name: 'BONTEMPS THÉO', email: 'theo.bontemps@etud.u-picardie.fr', role: 'Étudiant', promotions: ['2024 - MIAGE - M2', '2023 - MIAGE - M1'], actions: [
        { icon: <PencilIcon size={16} />, onClick: () => console.log('Edit Theo') },
        { icon: <MarkGithubIcon size={16} />, onClick: () => console.log('GitHub Theo') }
    ]},
    { name: 'DESCAMPS DORIAN', email: 'dorian.descamps@etud.u-picardie.fr', role: 'Étudiant', promotions: ['2024 - MIAGE - M2', '2023 - MIAGE - M1'], actions: [
        { icon: <PencilIcon size={16} />, onClick: () => console.log('Edit Dorian') },
        { icon: <MarkGithubIcon size={16} />, onClick: () => console.log('GitHub Dorian') }
    ]},
    { name: 'RHUIN MAËL', email: 'mael.rhuin@etud.u-picardie.fr', role: 'Étudiant', promotions: ['2024 - MIAGE - M2', '2023 - MIAGE - M1'], actions: [
        { icon: <PencilIcon size={16} />, onClick: () => console.log('Edit Mael') },
        { icon: <MarkGithubIcon size={16} />, onClick: () => console.log('GitHub Mael') }
    ]},
    { name: 'BERQUEZ PIERRE-LOUIS', email: 'pierre-louis.berquez@u-picardie.fr', role: 'Administrateur', promotions: ['-'], actions: [
        { icon: <PencilIcon size={16} />, onClick: () => console.log('Edit Pierre-Louis') },
        { icon: <MarkGithubIcon size={16} />, onClick: () => console.log('GitHub Pierre-Louis') }
    ]},
    { name: 'BARRY CATHERINE', email: 'catherine.barry@u-picardie.fr', role: 'Enseignant', promotions: ['-'], actions: [
        { icon: <PencilIcon size={16} />, onClick: () => console.log('Edit Catherine') },
        { icon: <MarkGithubIcon size={16} />, onClick: () => console.log('GitHub Catherine') }
    ]},
    { name: 'JEAN-LUC GUÉRIN', email: 'jean-luc.guerin@u-picardie.fr', role: 'Enseignant', promotions: ['-'], actions: [
        { icon: <PencilIcon size={16} />, onClick: () => console.log('Edit Jean-Luc') },
        // { icon: <MarkGithubIcon size={16} />, onClick: () => console.log('GitHub Jean-Luc') }
    ]},
    { name: 'LAPUJADE ANNE', email: 'anne.lapujade@u-picardie.fr', role: 'Administrateur', promotions: ['-'], actions: [
        { icon: <PencilIcon size={16} />, onClick: () => console.log('Edit Anne') },
        { icon: <MarkGithubIcon size={16} />, onClick: () => console.log('GitHub Anne') }
    ]},
];

const UsersPage = () => {
    return (
        <div className="p-4">
            <Table columns={columns} data={data} />
        </div>
    );
};

export default UsersPage;