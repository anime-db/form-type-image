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
 * Images
 * @package AnimeDb\Bundle\FormTypeImageBundle\Entity
 */
class Images
{
    /**
     * @Assert\Count(max = "10")
     * @Assert\All({
     *     @Assert\NotBlank(),
     *     @Assert\Image(
     *         maxSize = "2M",
     *         minWidth = 100,
     *         maxWidth = 2000,
     *         minHeight = 100,
     *         maxHeight = 2000
     *     )
     * })
     *
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
