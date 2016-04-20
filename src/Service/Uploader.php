<?php
/**
 * AnimeDb package
 *
 * @package   AnimeDb
 * @author    Peter Gribanov <info@peter-gribanov.ru>
 * @copyright Copyright (c) 2016, Peter Gribanov
 * @license   http://opensource.org/licenses/MIT
 */

namespace AnimeDb\Bundle\FormTypeImageBundle\Service;

use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Uploader
 * @package AnimeDb\Bundle\FormTypeImageBundle\Service
 */
class Uploader
{
    /**
     * @var string
     */
    protected $upload_dir = '';

    /**
     * @var string
     */
    protected $web_path = '';

    /**
     * @param string $web_path
     * @param string $upload_dir
     */
    public function __construct($upload_dir, $web_path)
    {
        $this->upload_dir = $upload_dir;
        $this->web_path = $web_path;
    }

    /**
     * @param UploadedFile $file
     *
     * @return string
     */
    public function upload(UploadedFile $file)
    {
        $file->move($this->upload_dir, $file->getClientOriginalName());
        return $file->getClientOriginalName();
    }

    /**
     * @return string
     */
    public function getWebPath()
    {
        return $this->web_path;
    }
}
