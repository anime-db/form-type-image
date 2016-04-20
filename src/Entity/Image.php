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

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Image
 * @package AnimeDb\Bundle\FormTypeImageBundle\Entity
 */
class Image
{
    /**
     * @Assert\NotBlank()
     * @Assert\Image(
     *     maxSize = "2M",
     *     minWidth = 100,
     *     maxWidth = 2000,
     *     minHeight = 100,
     *     maxHeight = 2000
     * )
     *
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
