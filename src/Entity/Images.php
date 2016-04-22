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
 * Images
 * @package AnimeDb\Bundle\FormTypeImageBundle\Entity
 */
class Images
{
    /**
     * @var UploadedFile[]
     */
    protected $files = [];

    /**
     * @return UploadedFile[]
     */
    public function getFiles()
    {
        return $this->files;
    }

    /**
     * @param UploadedFile[] $files
     *
     * @return Images
     */
    public function setFiles(array $files)
    {
        $this->files = $files;
        return $this;
    }
}
