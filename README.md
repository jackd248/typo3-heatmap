<div align="center">

![Extension icon](Resources/Public/Icons/Extension.png)

# TYPO3 extension `typo3_heatmap`

[![Latest Stable Version](https://typo3-badges.dev/badge/typo3_heatmap/version/shields.svg)](https://extensions.typo3.org/extension/typo3_heatmap)
[![Supported TYPO3 versions](https://typo3-badges.dev/badge/typo3_heatmap/typo3/shields.svg)](https://extensions.typo3.org/extension/typo3_heatmap)
[![Supported PHP Versions](https://img.shields.io/packagist/dependency-v/konradmichalik/typo3-heatmap/php?logo=php)](https://packagist.org/packages/konradmichalik/typo3-heatmap)
![Stability](https://typo3-badges.dev/badge/typo3_heatmap/stability/shields.svg)
[![Coverage](https://img.shields.io/coverallsCoverage/github/jackd248/typo3-heatmap?logo=coveralls)](https://coveralls.io/github/jackd248/typo3-heatmap)
[![CGL](https://img.shields.io/github/actions/workflow/status/jackd248/typo3-heatmap/cgl.yml?label=cgl&logo=github)](https://github.com/jackd248/typo3-heatmap/actions/workflows/cgl.yml)
[![Tests](https://img.shields.io/github/actions/workflow/status/jackd248/typo3-heatmap/tests.yml?label=tests&logo=github)](https://github.com/jackd248/typo3-heatmap/actions/workflows/tests.yml)
[![License](https://poser.pugx.org/konradmichalik/typo3-heatmap/license)](LICENSE.md)

</div>

This extension provides a dashboard widget to display a (GitHub lookalike) contribution heatmap of e.g. for TYPO3 content changes.

> [!warning]
> This package is in early development stage and may change significantly in the future. Use it at your own risk.

![Content changes heatmap](Documentation/Images/heatmap.jpg "Content changes heatmap")

## ✨ Features
* ![Content changes heatmap](Resources/Public/Icons/content-heatmap-widget.png "Content changes heatmap") **Dashboard heatmap for content changes:** Instantly visualize when and how much content was changed in TYPO3.
* ![Error heatmap](Resources/Public/Icons/error-heatmap-widget.png "Error heatmap") **Dashboard heatmap for system errors:** Quickly identify critical periods and error spikes with a clear heatmap overview.
* ![Login heatmap](Resources/Public/Icons/login-heatmap-widget.png "Login heatmap") **Dashboard heatmap for user logins:** Track user activity and login patterns over time with a visual heatmap.
* ![Custom heatmap](Resources/Public/Icons/custom-heatmap-widget.png "Custom heatmap") **Custom heatmap widgets:** Flexibly extend your dashboard with your own widgets, e\.g\. for visitor analytics or other data sources.

## 🔥 Installation

### Requirements

* TYPO3 >= 12.4
* PHP 8.2+

### Composer

[![Packagist](https://img.shields.io/packagist/v/konradmichalik/typo3-heatmap?label=version&logo=packagist)](https://packagist.org/packages/konradmichalik/typo3-heatmap)
[![Packagist Downloads](https://img.shields.io/packagist/dt/konradmichalik/typo3-heatmap?color=brightgreen)](https://packagist.org/packages/konradmichalik/typo3-heatmap)

``` bash
composer require konradmichalik/typo3-heatmap
```

### TER

[![TER version](https://typo3-badges.dev/badge/typo3_heatmap/version/shields.svg)](https://extensions.typo3.org/extension/typo3_heatmap)
[![TER downloads](https://typo3-badges.dev/badge/typo3_heatmap/downloads/shields.svg)](https://extensions.typo3.org/extension/typo3_heatmap)

Download the zip file from [TYPO3 extension repository (TER)](https://extensions.typo3.org/extension/typo3_heatmap).

## ⚡ Usage

1. Install the extension.
2. Add the "Content changes (Heatmap)" widget to your dashboard via the "System Information" tab.

![Select widget in the dashboard](Documentation/Images/select-widget.jpg "Select widget in the dashboard")

3. Display the heatmap within your dashboard.

![Show widget in the dashboard](Documentation/Images/widget.jpg "Show widget in the dashboard")

### Custom Heatmap Widgets

You can register your own heatmap widgets by implementing a [custom data provider](./Documentation/DataProviders.md).

## 🧑‍💻 Contributing

Please have a look at [`CONTRIBUTING.md`](CONTRIBUTING.md).

## 💎 Credits

The extension icon based on  the original
[`content`](https://typo3.github.io/TYPO3.Icons/icons/content/content.html) icon from TYPO3 core which is
originally licensed under [MIT License](https://github.com/TYPO3/TYPO3.Icons/blob/main/LICENSE).

Empty icon by Chattapat from <a href="https://thenounproject.com/browse/icons/term/empty/" target="_blank" title="Empty Icons">Noun Project</a> (CC BY 3.0)

## ⭐ License

This project is licensed
under [GNU General Public License 2.0 (or later)](LICENSE.md).