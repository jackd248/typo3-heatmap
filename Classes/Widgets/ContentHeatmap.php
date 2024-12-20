<?php

declare(strict_types=1);

namespace Kmi\Typo3ContentHeatmap\Widgets;

use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Page\JavaScriptModuleInstruction;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Dashboard\Widgets\AdditionalCssInterface;
use TYPO3\CMS\Dashboard\Widgets\ButtonProviderInterface;
use TYPO3\CMS\Dashboard\Widgets\JavaScriptInterface;
use TYPO3\CMS\Dashboard\Widgets\ListDataProviderInterface;
use TYPO3\CMS\Dashboard\Widgets\WidgetConfigurationInterface;
use TYPO3\CMS\Dashboard\Widgets\WidgetInterface;
use TYPO3\CMS\Fluid\View\StandaloneView;
use Kmi\Typo3ContentHeatmap\Configuration;

class ContentHeatmap implements WidgetInterface, AdditionalCssInterface, JavaScriptInterface
{
    protected ServerRequestInterface $request;

    public function __construct(
        protected readonly WidgetConfigurationInterface $configuration,
        protected readonly ListDataProviderInterface $dataProvider,
        protected readonly ?ButtonProviderInterface $buttonProvider = null,
        protected array $options = []
    ) {
    }

    public function renderWidgetContent(): string
    {
        $template = GeneralUtility::getFileAbsFileName('EXT:typo3_content_heatmap/Resources/Private/Templates/List.html');

        // preparing view
        $view = GeneralUtility::makeInstance(StandaloneView::class);
        $view->setFormat('html');
        $view->setTemplateRootPaths(['EXT:typo3_content_heatmap/Resources/Private/Templates/']);
        $view->setPartialRootPaths(['EXT:typo3_content_heatmap/Resources/Private/Partials/']);
        $view->setTemplatePathAndFilename($template);

        $view->assignMultiple([
            'configuration' => $this->configuration,
            'records' => $this->dataProvider->getItems(),
            'button' => $this->buttonProvider,
            'options' => $this->options,
        ]);
        return $view->render();
    }

    public function getOptions(): array
    {
        return $this->options;
    }

    public function getCssFiles(): array
    {
        return ['EXT:' . Configuration::EXT_KEY . '/Resources/Public/Css/Styles.css'];
    }

    public function getJavaScriptModuleInstructions(): array
    {
        return [
            JavaScriptModuleInstruction::create('@kmi/typo3contentheatmap/heatmap.js'),
        ];
    }
}
