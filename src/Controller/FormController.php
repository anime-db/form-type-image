<?php
/**
 * AnimeDb package
 *
 * @package   AnimeDb
 * @author    Peter Gribanov <info@peter-gribanov.ru>
 * @copyright Copyright (c) 2016, Peter Gribanov
 * @license   http://opensource.org/licenses/MIT
 */

namespace AnimeDb\Bundle\FormTypeImageBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authorization\Voter\AuthenticatedVoter;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\Translation\TranslatorInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use AnimeDb\Bundle\FormTypeImageBundle\Service\Uploader;
use AnimeDb\Bundle\FormTypeImageBundle\Entity\Image;
use AnimeDb\Bundle\FormTypeImageBundle\Entity\Images;
use AnimeDb\Bundle\FormTypeImageBundle\Form\ImageCollectionHandlerForm;
use AnimeDb\Bundle\FormTypeImageBundle\Form\ImageHandlerForm;

/**
 * FormController
 * @package AnimeDb\Bundle\FormTypeImageBundle\Controller
 */
class FormController extends Controller
{
    /**
     * @Configuration\Route(
     *   "/form/upload_image.json",
     *   name="anime_db_form_upload_image",
     *   condition="request.isXmlHttpRequest()"
     * )
     * @Configuration\Method({"POST"})
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function uploadImageAction(Request $request)
    {
        $this->denyAccessUnlessGranted(AuthenticatedVoter::IS_AUTHENTICATED_REMEMBERED);
        $image = new Image();
        $form = $this
            ->createForm(ImageHandlerForm::class, $image)
            ->handleRequest($request);

        if (!$form->isValid()) {
            return new JsonResponse([
                'status' => 0,
                'message' => $this->getError($form, 'file', 'word.error.failed_upload_image')
            ]);
        }

        $filename = $this->getUploader()->upload($image->getFile());
        return new JsonResponse([
            'status' => 1,
            'filename' => $filename,
            'web_path' => $this->getUploader()->getWebPath().$filename
        ]);
    }

    /**
     * @Configuration\Route(
     *   "/form/upload_images.json",
     *   name="anime_db_form_upload_images",
     *   condition="request.isXmlHttpRequest()"
     * )
     * @Configuration\Method({"POST"})
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function uploadImagesAction(Request $request)
    {
        $this->denyAccessUnlessGranted(AuthenticatedVoter::IS_AUTHENTICATED_REMEMBERED);
        $image = new Images();
        $form = $this
            ->createForm(ImageCollectionHandlerForm::class, $image)
            ->handleRequest($request);

        if (!$form->isValid()) {
            return new JsonResponse([
                'status' => 0,
                'message' => $this->getError($form, 'files', 'word.error.failed_upload_images')
            ]);
        }

        $files = [];
        foreach ($image->getFiles() as $file) {
            $filename = $this->getUploader()->upload($file);
            $files[] = [
                'filename' => $filename,
                'web_path' => $this->getUploader()->getWebPath().$filename
            ];
        }

        return new JsonResponse([
            'status' => 1,
            'files' => $files
        ]);
    }

    /**
     * @Configuration\Route(
     *   "/form/token/{token_id}/generate.json",
     *   defaults={"token_id" = "form"},
     *   name="anime_db_form_generate_token",
     *   condition="request.isXmlHttpRequest()"
     * )
     * @Configuration\Method({"POST"})
     *
     * @param string $token_id
     *
     * @return Response
     */
    public function generateTokenAction($token_id)
    {
        $this->denyAccessUnlessGranted(AuthenticatedVoter::IS_AUTHENTICATED_REMEMBERED);
        return new Response($this->getTokenManager()->refreshToken($token_id));
    }

    /**
     * @param FormInterface $form
     * @param string $field
     * @param string $default_error
     *
     * @return string
     */
    protected function getError(FormInterface $form, $field, $default_error)
    {
        $error = '';
        if ($form->getErrors()->count()) {
            $error = $form->getErrors()->current()->getMessage();
        } elseif ($form->get($field)->getErrors()->count()) {
            $error = $form->get($field)->getErrors()->current()->getMessage();
        }

        return $error ?: $this->getTranslator()->trans($default_error);
    }

    /**
     * @return Uploader
     */
    protected function getUploader()
    {
        return $this->get('anime_db.uploader');
    }

    /**
     * @return CsrfTokenManagerInterface
     */
    protected function getTokenManager()
    {
        return $this->get('security.csrf.token_manager');
    }

    /**
     * @return TranslatorInterface
     */
    protected function getTranslator()
    {
        return $this->get('translator');
    }

    /**
     * @param mixed $attributes
     * @param mixed $object
     * @param string $message
     */
    protected function denyAccessUnlessGranted($attributes, $object = null, $message = 'Access Denied.')
    {
        if ($this->getParameter('anime_db.upload_image.authorized')) {
            parent::denyAccessUnlessGranted($attributes, $object, $message);
        }
    }
}
