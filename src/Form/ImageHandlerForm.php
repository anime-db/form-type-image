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
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Image;

/**
 * ImageHandlerForm
 * @package AnimeDb\Bundle\FormTypeImageBundle\Form
 */
class ImageHandlerForm extends AbstractType
{
    /**
     * @var array
     */
    protected $options;

    /**
     * @param string $max_size
     * @param int $min_width
     * @param int $min_height
     * @param int $max_width
     * @param int $max_height
     */
    public function __construct($max_size, $min_width, $min_height, $max_width, $max_height)
    {
        $this->options = array_filter([
            'maxSize' => $max_size,
            'minWidth' => $min_width,
            'minHeight' => $min_height,
            'maxWidth' => $max_width,
            'maxHeight' => $max_height
        ]);
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('file', FileType::class, [
            'constraints' => [
                new NotBlank(),
                new Image($this->options)
            ]
        ]);
    }
}
