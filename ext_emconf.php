<?php

/** @var string $_EXTKEY */
$EM_CONF[$_EXTKEY] = [
    'title' => 'Recent Updates Widget',
    'description' => 'A widget for the dashboard to display new and recently updated elements.',
    'category' => 'module',
    'author' => 'Konrad Michalik',
    'author_email' => 'konrad.michalik@xima.de',
    'author_company' => 'XIMA MEDIA GmbH',
    'state' => 'stable',
    'version' => '1.0.1',
    'constraints' => [
        'depends' => [
            'php' => '8.1.0-8.99.99',
            'typo3' => '11.0.0-13.99.99',
        ],
        'conflicts' => [],
        'suggests' => [],
    ],
];
