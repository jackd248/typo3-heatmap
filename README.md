<div align="center">

![Extension icon](Resources/Public/Icons/Extension.png)

# TYPO3 extension `typo3_heatmap_widget`

[![Latest Stable Version](https://typo3-badges.dev/badge/typo3_heatmap_widget/version/shields.svg)](https://extensions.typo3.org/extension/typo3_heatmap_widget)
[![Supported TYPO3 versions](https://typo3-badges.dev/badge/typo3_heatmap_widget/typo3/shields.svg)](https://extensions.typo3.org/extension/typo3_heatmap_widget)
[![Supported PHP Versions](https://img.shields.io/packagist/dependency-v/konradmichalik/typo3-heatmap-widget/php?logo=php)](https://packagist.org/packages/konradmichalik/typo3-heatmap-widget)
[![CGL](https://img.shields.io/github/actions/workflow/status/jackd248/typo3-heatmap-widget/cgl.yml?label=cgl&logo=github)](https://github.com/jackd248/typo3-heatmap-widget/actions/workflows/cgl.yml)
[![Tests](https://img.shields.io/github/actions/workflow/status/jackd248/typo3-heatmap-widget/tests.yml?label=tests&logo=github)](https://github.com/jackd248/typo3-heatmap-widget/actions/workflows/tests.yml)
[![License](https://poser.pugx.org/konradmichalik/typo3-heatmap-widget/license)](LICENSE.md)

</div>

This extension provides a dashboard widget to display a (GitHub lookalike) contribution heatmap of e.g. for TYPO3 content changes.

> [!warning]
> This package is in early development stage and may change significantly in the future. Use it at your own risk.

![Content changes heatmap](Documentation/Images/heatmap.jpg "Content changes heatmap")

## Features
* **Dashboard heatmap for content changes:** Instantly visualize when and how much content was changed in TYPO3.
* **Dashboard heatmap for system errors:** Quickly identify critical periods and error spikes with a clear heatmap overview.
* **Custom heatmap widgets:** Flexibly extend your dashboard with your own widgets, e\.g\. for visitor analytics or other data sources.

## 🔥 Installation

### Requirements

* TYPO3 >= 12.4
* PHP 8.2+

### Composer

[![Packagist](https://img.shields.io/packagist/v/konradmichalik/typo3-heatmap-widget?label=version&logo=packagist)](https://packagist.org/packages/konradmichalik/typo3-heatmap-widget)
[![Packagist Downloads](https://img.shields.io/packagist/dt/konradmichalik/typo3-heatmap-widget?color=brightgreen)](https://packagist.org/packages/konradmichalik/typo3-heatmap-widget)

``` bash
composer require konradmichalik/typo3-heatmap-widget
```

### TER

[![TER version](https://typo3-badges.dev/badge/typo3_heatmap_widget/version/shields.svg)](https://extensions.typo3.org/extension/typo3_heatmap_widget)
[![TER downloads](https://typo3-badges.dev/badge/typo3_heatmap_widget/downloads/shields.svg)](https://extensions.typo3.org/extension/typo3_heatmap_widget)

Download the zip file from [TYPO3 extension repository (TER)](https://extensions.typo3.org/extension/typo3_heatmap_widget).

## ⚡ Usage

1. Install the extension.
2. Add the "Content changes" widget to your dashboard via the "System Information" tab.
3. Display the heatmap within your dashboard.

![Show widget in the dashboard](Documentation/Images/widget.jpg "Show widget in the dashboard")

### Custom Heatmap Widgets

You can register your own heatmap widgets by implementing a [custom data provider](./Documentation/DataProviders.md).

## 🧑‍💻 Contributing

Please have a look at [`CONTRIBUTING.md`](CONTRIBUTING.md).

## 💎 Credits

Empty by Chattapat from <a href="https://thenounproject.com/browse/icons/term/empty/" target="_blank" title="Empty Icons">Noun Project</a> (CC BY 3.0)

## ⭐ License

This project is licensed
under [GNU General Public License 2.0 (or later)](LICENSE.md).