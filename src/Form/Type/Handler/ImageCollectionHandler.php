<?php
/**
 * AnimeDb package
 *
 * @package   AnimeDb
 * @author    Peter Gribanov <info@peter-gribanov.ru>
 * @copyright Copyright (c) 2016, Peter Gribanov
 * @license   http://opensource.org/licenses/MIT
 */

namespace AnimeDb\Bundle\FormTypeImageBundle\Form\Type\Handler;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints\Count;
use Symfony\Component\Validator\Constraints\All;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Image;

/**
 * ImageCollectionHandler
 * @package AnimeDb\Bundle\FormTypeImageBundle\Form\Type\Handler
 */
class ImageCollectionHandler extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('files', 'file', [
            'multiple' => true,
            'constraints' => [
                new Count(['max' => 10]),
                new All([
                    new NotBlank(),
                    new Image([
                        'maxSize' => '2M',
                        'minWidth' => 100,
                        'maxWidth' => 2000,
                        'minHeight' => 100,
                        'maxHeight' => 2000
                    ])
                ])
            ]
        ]);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'anime_db_image_collection_handler';
    }
}
