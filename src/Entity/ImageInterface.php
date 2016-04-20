<?php
/**
 * AnimeDb package
 *
 * @package   AnimeDb
 * @author    Peter Gribanov <info@peter-gribanov.ru>
 * @copyright Copyright (c) 2016, Peter Gribanov
 * @license   http://opensource.org/licenses/MIT
 */

namespace AnimeDb\Bundle\FormTypeImageBundle\Entity;

/**
 * ImageInterface
 * @package AnimeDb\Bundle\FormTypeImageBundle\Entity
 */
interface ImageInterface
{
    /**
     * @return string
     */
    public function getImageWebPath();
}
