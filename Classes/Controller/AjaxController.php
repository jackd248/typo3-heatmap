<?php

declare(strict_types=1);

/*
 * This file is part of the TYPO3 CMS extension "typo3_heatmap".
 *
 * Copyright (C) 2025 Konrad Michalik <hej@konradmichalik.dev>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

namespace KonradMichalik\Typo3Heatmap\Controller;

use KonradMichalik\Typo3Heatmap\Domain\Repository\ActivityRepository;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Http\JsonResponse;

class AjaxController
{
    public function __construct(protected readonly ActivityRepository $activityRepository) {}

    public function getUserActivityContentChanges(ServerRequestInterface $request): ResponseInterface
    {
        $body = json_decode($request->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
        $userId = (int)($body['userId'] ?? 0);
        $duration = (int)($body['duration'] ?? 365);

        if ($userId === 0) {
            return new JsonResponse(['error' => 'Invalid user ID'], 400);
        }

        try {
            return new JsonResponse(
                $this->activityRepository->getContentChangesForUser($userId, $duration),
            );
        } catch (\Exception) {
            return new JsonResponse(['error' => 'Failed to load content changes data'], 500);
        }
    }

    public function getUserActivityLogins(ServerRequestInterface $request): ResponseInterface
    {
        $body = json_decode($request->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
        $userId = (int)($body['userId'] ?? 0);
        $duration = (int)($body['duration'] ?? 365);

        if ($userId === 0) {
            return new JsonResponse(['error' => 'Invalid user ID'], 400);
        }

        try {
            return new JsonResponse(
                $this->activityRepository->getLoginActivityForUser($userId, $duration)
            );
        } catch (\Exception) {
            return new JsonResponse(['error' => 'Failed to load login activity data'], 500);
        }
    }
}
