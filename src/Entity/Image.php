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

use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Image
 * @package AnimeDb\Bundle\FormTypeImageBundle\Entity
 */
class Image
{
    /**
     * @var UploadedFile
     */
    protected $file;

    /**
     * @return UploadedFile
     */
    public function getFile()
    {
        return $this->file;
    }

    /**
     * @param UploadedFile $file
     *
     * @return Image
     */
    public function setFile(UploadedFile $file)
    {
        $this->file = $file;
        return $this;
    }
}
