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

use Symfony\Component\Config\Definition\ConfigurationInterface;
use Symfony\Component\Config\Definition\Builder\TreeBuilder;

/**
 * Configuration
 * @package AnimeDb\Bundle\FormTypeImageBundle\DependencyInjection
 */
class Configuration implements ConfigurationInterface
{
    /**
     * @return TreeBuilder
     */
    public function getConfigTreeBuilder()
    {
        $treeBuilder = new TreeBuilder();
        $rootNode = $treeBuilder->root('anime_db_form_type_image');

        /**
         * Example config:
         *
         * anime_db_cache_time_keeper:
         *     web_path: '/upload/'
         *     constraint:
         *         files_limit: 10
         *         max_size: '2M'
         *         min_width: 100
         *         min_height: 100
         *         max_width: 2000
         *         max_height: 2000
         */
        $rootNode
            ->children()
                ->scalarNode('web_path')
                    ->cannotBeEmpty()
                    ->defaultValue('/upload/')
                ->end()
                ->arrayNode('constraint')
                    ->children()
                        ->integerNode('files_limit')
                            ->cannotBeEmpty()
                            ->defaultValue(10)
                        ->end()
                        ->scalarNode('max_size')
                        ->end()
                        ->integerNode('min_width')
                        ->end()
                        ->integerNode('min_height')
                        ->end()
                        ->integerNode('max_width')
                        ->end()
                        ->integerNode('max_height')
                        ->end()
                    ->end()
                ->end() // constraint
            ->end()
        ;
        return $treeBuilder;
    }
}
