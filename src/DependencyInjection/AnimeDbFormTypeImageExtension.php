<?php
/**
 * AnimeDb package
 *
 * @package   AnimeDb
 * @author    Peter Gribanov <info@peter-gribanov.ru>
 * @copyright Copyright (c) 2016, Peter Gribanov
 * @license   http://opensource.org/licenses/MIT
 */

namespace AnimeDb\Bundle\FormTypeImageBundle\DependencyInjection;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;

/**
 * AnimeDbFormTypeImageExtension
 * @package AnimeDb\Bundle\FormTypeImageBundle\DependencyInjection
 */
class AnimeDbFormTypeImageExtension extends Extension
{
    /**
     * @param array $configs
     * @param ContainerBuilder $container
     */
    public function load(array $configs, ContainerBuilder $container)
    {
        $loader = new YamlFileLoader($container, new FileLocator(__DIR__ . '/../Resources/config'));
        $loader->load('parameters.yml');
        $loader->load('services.yml');

        $configuration = new Configuration();
        $config = $this->processConfiguration($configuration, $configs);

        $container->setParameter('anime_db.upload_image.web_path', $config['web_path']);
        $container->setParameter('anime_db.upload_image.constraint.files_limit', $config['constraint']['files_limit']);
        $container->setParameter('anime_db.upload_image.constraint.max_size', $config['constraint']['max_size']);
        $container->setParameter('anime_db.upload_image.constraint.min_width', $config['constraint']['min_width']);
        $container->setParameter('anime_db.upload_image.constraint.min_height', $config['constraint']['min_height']);
        $container->setParameter('anime_db.upload_image.constraint.max_width', $config['constraint']['max_width']);
        $container->setParameter('anime_db.upload_image.constraint.max_height', $config['constraint']['max_height']);
    }
}
