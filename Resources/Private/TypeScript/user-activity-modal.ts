/**
 * Module: @KonradMichalik/Typo3Heatmap/user-activity-modal
 *
 * Modal popup for user activity heatmaps in backend user edit forms
 */
declare var TYPO3: any;
// @ts-ignore
import Modal from "@typo3/backend/modal.js"
// @ts-ignore
import AjaxRequest from "@typo3/core/ajax/ajax-request.js";
import {HeatmapRenderer} from './renderer.js';
import {HeatmapData, HeatmapOptions} from './types.js';

/**
 * User Activity Modal for backend forms
 */
class UserActivityModal {
    private currentUserId: number = 0;
    private modal: any;

    constructor() {
        this.initializeEventListeners();
    }

    private initializeEventListeners(): void {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeButton();
        });

        const observer = new MutationObserver(() => {
            this.initializeButton();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    private initializeButton(): void {
        const button = document.querySelector('.user-activity-modal-btn[data-action="open-user-activity-modal"]');
        if (!button) return;

        if (button.hasAttribute('data-initialized')) return;

        const userId = button.getAttribute('data-user-id');
        if (!userId || userId === '0') return;

        this.currentUserId = parseInt(userId, 10);

        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.openModal();
        });

        button.setAttribute('data-initialized', 'true');
    }

    private async openModal(): Promise<void> {
        if (this.currentUserId === 0) return;

        const modalContent = this.createModalContent();

        this.modal = Modal.advanced({
            title: 'User Activity Heatmaps',
            content: document.createRange().createContextualFragment(modalContent),
            size: Modal.sizes.large,
            buttons: [
                {
                    text: 'Close',
                    active: true,
                    btnClass: 'btn-default',
                    trigger: (modal: any) => this.modal.hideModal()
                }
            ],
            callback: () => {
                this.initializeTabs();
                this.loadHeatmapData();
            }
        });
    }

    private createModalContent(): string {
        return `
            <div class="user-activity-modal" style="height: 100%;min-height: 300px;">
                <ul class="nav nav-tabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="content-changes-tab" data-bs-toggle="tab"
                                data-bs-target="#content-changes" type="button" role="tab"
                                aria-controls="content-changes" aria-selected="true">
                            Content Changes
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="logins-tab" data-bs-toggle="tab"
                                data-bs-target="#logins" type="button" role="tab"
                                aria-controls="logins" aria-selected="false">
                            Login Activity
                        </button>
                    </li>
                </ul>
                <div class="tab-content mt-3" style="height: 100%;min-height: 300px;">
                    <div class="tab-pane fade show active" id="content-changes" role="tabpanel"
                         aria-labelledby="content-changes-tab" style="height: 100%;min-height: 300px;">
                        <div class="heatmap-container" id="content-changes-heatmap" style="height: 100%;min-height: 300px;">
                            <div class="text-center p-4">
                                <div class="spinner-border" role="status"></div>
                                <p class="mt-2">Loading content changes data...</p>
                            </div>
                        </div>
                    </div>
                    <div class="tab-pane fade" id="logins" role="tabpanel"
                         aria-labelledby="logins-tab" style="height: 100%;min-height: 300px;">
                        <div class="heatmap-container" id="logins-heatmap" style="height: 100%;min-height: 300px;">
                            <div class="text-center p-4">
                                <div class="spinner-border" role="status"></div>
                                <p class="mt-2">Loading login activity data...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    private initializeTabs(): void {
        const tabButtons = this.modal.querySelectorAll('[data-bs-toggle="tab"]');
        tabButtons.forEach((button: any) => {
            button.addEventListener('shown.bs.tab', (event: any) => {
                const target = (event.target as HTMLElement).getAttribute('data-bs-target');
                if (target === '#logins' && !document.querySelector('#logins-heatmap[data-loaded="true"]')) {
                    this.loadLoginHeatmap();
                }
            });
        });
    }

    private async loadHeatmapData(): Promise<void> {
        // Load content changes heatmap first (active tab)
        await this.loadContentChangesHeatmap();
    }

    private async loadContentChangesHeatmap(): Promise<void> {
        const container = this.modal.querySelector('#content-changes-heatmap');
        if (!container) {
            console.error('Content changes container not found');
            return;
        }

        try {
            new AjaxRequest(TYPO3.settings.ajaxUrls.typo3heatmap_getuseractivitycontentchanges)
                .post(
                    JSON.stringify({
                        userId: this.currentUserId,
                        duration: 365
                    })
                )
                .then(async (result: any) => {
                    if (!result.response.ok) {
                        throw new Error('Failed to load content changes data');
                    }

                    const body = await result.resolve();
                    if (!body || !Array.isArray(body)) {
                        throw new Error('Invalid data format received');
                    }

                    const data: HeatmapData[] = body;

                    const options: HeatmapOptions = {
                        duration: 365,
                        color: '255,140,0', // Orange for content changes
                        tooltipItemSingular: 'change',
                        tooltipItemPlural: 'changes',
                        dateRangeMode: 'auto',
                        locale: 'en-GB',
                        showLegend: true,
                        showYearLabels: true,
                        showMonthLabels: true,
                        minCellSize: 8,
                        maxCellSize: 20,
                        tooltipWidth: 120,
                        tooltipHeight: 26,
                        legendLess: 'Less',
                        legendMore: 'More',
                        weekStartsOnMonday: false
                    };

                    container.innerHTML = '';
                    new HeatmapRenderer(container, data, options);
                    container.setAttribute('data-loaded', 'true');
                })


        } catch (error) {
            container.innerHTML = `<div class="alert alert-danger">
                <div class="media">
                    <div class="media-left">
                        <span class="fa-stack fa-lg">
                            <i class="fa fa-circle fa-stack-2x"></i>
                            <i class="fa fa-exclamation fa-stack-1x fa-inverse"></i>
                        </span>
                    </div>
                    <div class="media-body">
                        <p>Failed to load content changes data.</p>
                    </div>
                </div>
            </div>`;
        }
    }

    private async loadLoginHeatmap(): Promise<void> {
        const container = this.modal.querySelector('#logins-heatmap');
        if (!container || container.getAttribute('data-loaded') === 'true') return;

        try {
            new AjaxRequest(TYPO3.settings.ajaxUrls.typo3heatmap_getuseractivitylogins)
                .post(
                    JSON.stringify({
                        userId: this.currentUserId,
                        duration: 365
                    })
                )
                .then(async (result: any) => {
                        if (!result.response.ok) {
                            throw new Error('Failed to load content changes data');
                        }

                        const body = await result.resolve();
                        if (!body || !Array.isArray(body)) {
                            throw new Error('Invalid data format received');
                        }

                        const data: HeatmapData[] = body;
                        const options: HeatmapOptions = {
                            duration: 365,
                            color: '40,120,181', // Blue for logins
                            tooltipItemSingular: 'login',
                            tooltipItemPlural: 'logins',
                            dateRangeMode: 'auto',
                            locale: 'en-GB',
                            showLegend: true,
                            showYearLabels: true,
                            showMonthLabels: true,
                            minCellSize: 8,
                            maxCellSize: 20,
                            tooltipWidth: 120,
                            tooltipHeight: 26,
                            legendLess: 'Less',
                            legendMore: 'More',
                            weekStartsOnMonday: false
                        };

                        container.innerHTML = '';
                        new HeatmapRenderer(container, data, options);
                        container.setAttribute('data-loaded', 'true');
                    }
                );

        } catch (error) {
            container.innerHTML = `<div class="alert alert-danger">
                <div class="media">
                    <div class="media-left">
                        <span class="fa-stack fa-lg">
                            <i class="fa fa-circle fa-stack-2x"></i>
                            <i class="fa fa-exclamation fa-stack-1x fa-inverse"></i>
                        </span>
                    </div>
                    <div class="media-body">
                        <p>Failed to load login activity data.</p>
                    </div>
                </div>
            </div>`;
        }
    }
}

// @ts-ignore
export default new UserActivityModal();
