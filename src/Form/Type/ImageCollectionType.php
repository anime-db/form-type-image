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
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * ImageCollection
 * @package AnimeDb\Bundle\FormTypeImageBundle\Form\Type
 */
class ImageCollection extends CollectionType
{
    /**
     * @var int
     */
    protected $files_limit;

    /**
     * @param int $files_limit
     */
    public function __construct($files_limit)
    {
        $this->files_limit = $files_limit;
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'upload_files_limit' => $this->files_limit
        ]);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->getBlockPrefix();
    }

    /**
     * @return string
     */
    public function getBlockPrefix()
    {
        return 'image_collection';
    }
}
