<?php
/**
 * AnimeDb package
 *
 * @package   AnimeDb
 * @author    Peter Gribanov <info@peter-gribanov.ru>
 * @copyright Copyright (c) 2016, Peter Gribanov
 * @license   http://opensource.org/licenses/MIT
 */

namespace AnimeDb\Bundle\FormTypeImageBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints\Count;
use Symfony\Component\Validator\Constraints\All;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Image;

/**
 * ImageCollectionForm
 * @package AnimeDb\Bundle\FormTypeImageBundle\Form
 */
class ImageCollectionHandlerForm extends AbstractType
{
    /**
     * @var array
     */
    protected $options;

    /**
     * @var int
     */
    protected $files_limit;

    /**
     * @param string $max_size
     * @param int $min_width
     * @param int $min_height
     * @param int $max_width
     * @param int $max_height
     * @param int $files_limit
     */
    public function __construct($max_size, $min_width, $min_height, $max_width, $max_height, $files_limit)
    {
        $this->options = array_filter([
            'maxSize' => $max_size,
            'minWidth' => $min_width,
            'minHeight' => $min_height,
            'maxWidth' => $max_width,
            'maxHeight' => $max_height
        ]);
        $this->files_limit = $files_limit;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {

        $builder->add('files', FileType::class, [
            'multiple' => true,
            'data_class' => null,
            'constraints' => [
                new Count(['max' => $this->files_limit]),
                new All([
                    new NotBlank(),
                    new Image($this->options)
                ])
            ]
        ]);
    }
}
