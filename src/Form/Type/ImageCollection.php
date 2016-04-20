<?php
/**
 * AnimeDb package
 *
 * @package   AnimeDb
 * @author    Peter Gribanov <info@peter-gribanov.ru>
 * @copyright Copyright (c) 2016, Peter Gribanov
 * @license   http://opensource.org/licenses/MIT
 */

namespace AnimeDb\Bundle\FormTypeImageBundle\Form\Type;

use Symfony\Component\Form\Extension\Core\Type\CollectionType;

/**
 * ImageCollection
 * @package AnimeDb\Bundle\FormTypeImageBundle\Form\Type
 */
class ImageCollection extends CollectionType
{
    /**
     * @return string
     */
    public function getName()
    {
        return 'image_collection';
    }
}
