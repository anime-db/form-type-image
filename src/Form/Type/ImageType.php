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

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormView;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use AnimeDb\Bundle\FormTypeImageBundle\Entity\ImageInterface;

/**
 * Image form field
 * @package AnimeDb\Bundle\FormTypeImageBundle\Form\Type
 */
class ImageType extends AbstractType
{
    /**
     * @param FormView $view
     * @param FormInterface $form
     * @param array $options
     */
    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        $entity = $form->getParent()->getData();
        if ($entity instanceof ImageInterface) {
            $view->vars['image_url'] = $entity->getImageWebPath();
        }

        $view->vars['attr']['class'] = 'form-image-upload-__input '.$view->vars['attr']['class'];
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'image_url' => null,
            'attr' => [
                'class' => ''
            ]
        ]);
    }

    /**
     * @return string
     */
    public function getParent()
    {
        return 'text';
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'image';
    }
}
