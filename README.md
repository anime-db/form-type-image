[![Latest Stable Version](https://poser.pugx.org/anime-db/form-type-image-bundle/v/stable.png)](https://packagist.org/packages/anime-db/form-type-image-bundle)
[![Latest Unstable Version](https://poser.pugx.org/anime-db/form-type-image-bundle/v/unstable.png)](https://packagist.org/packages/anime-db/form-type-image-bundle)
[![Total Downloads](https://poser.pugx.org/anime-db/form-type-image-bundle/downloads)](https://packagist.org/packages/anime-db/form-type-image-bundle)
[![Build Status](https://travis-ci.org/anime-db/form-type-image-bundle.svg?branch=master)](https://travis-ci.org/anime-db/form-type-image-bundle)
[![Code Coverage](https://scrutinizer-ci.com/g/anime-db/form-type-image-bundle/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/anime-db/form-type-image-bundle/?branch=master)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/anime-db/form-type-image-bundle/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/anime-db/form-type-image-bundle/?branch=master)
[![SensioLabsInsight](https://insight.sensiolabs.com/projects/f83dabf8-d5b0-4586-b254-af742df345c6/mini.png)](https://insight.sensiolabs.com/projects/f83dabf8-d5b0-4586-b254-af742df345c6)
[![License](https://poser.pugx.org/anime-db/form-type-image-bundle/license.png)](https://packagist.org/packages/anime-db/form-type-image-bundle)

# Image upload form type

## Installation

Pretty simple with [Composer](http://packagist.org), run:

```sh
composer require anime-db/form-type-image-bundle
```

Add FormTypeImageBundle to your application kernel

```php
// app/AppKernel.php
public function registerBundles()
{
    return array(
        // ...
        new AnimeDb\Bundle\FormTypeImageBundle\AnimeDbFormTypeImageBundle(),
        // ...
    );
}
```

## Configuration

Default config

```yml
anime_db_cache_time_keeper:
    web_path: '/upload/' # Upload images directory: %kernel.root_dir%/../web/upload/
    authorized: true     # Only authorized users can upload images
    constraint:
        files_limit: 10  # Limiting the number of simultaneous file upload
        max_size: null   # Max file size. Example: 2M
        min_width:  0    # Minimum image width
        min_height: 0    # Minimum image height
        max_width:  0    # Maximum image width
        max_height: 0    # Maximum image height
```

## Usage

```php
use AnimeDb\Bundle\FormTypeImageBundle\Form\Type\ImageType;
use AnimeDb\Bundle\FormTypeImageBundle\Form\Type\ImageCollectionType;

$form = $this
    ->createFormBuilder()
    ->add('cover', ImageType::class)
    ->add('covers', ImageCollectionType::class);
```
