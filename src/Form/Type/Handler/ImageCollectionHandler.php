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
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('files', 'file', [
            'multiple' => true,
            'constraints' => [
                new Count(['max' => $this->files_limit]),
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
}
