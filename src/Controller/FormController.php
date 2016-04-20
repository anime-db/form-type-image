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
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use AnimeDb\Bundle\FormTypeImageBundle\Service\Uploader;
use AnimeDb\Bundle\FormTypeImageBundle\Entity\Image;
use AnimeDb\Bundle\FormTypeImageBundle\Entity\Images;

/**
 * FormController
 * @package AnimeDb\Bundle\FormTypeImageBundle\Controller
 */
class FormController extends Controller
{
    /**
     * @Route(
     *   "/form/upload_image.json",
     *   name="anime_db_form_upload_image",
     *   condition="request.isXmlHttpRequest()"
     * )
     * @Method({"POST"})
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function uploadImageAction(Request $request)
    {
        $image = new Image();
        $form = $this
            ->createFormBuilder($image)
            ->add('file', 'file')
            ->getForm()
            ->handleRequest($request);

        if (!$form->isValid()) {
            $error = $this->get('translator')->trans('word.error.failed_upload_image');
            if ($form->getErrors()->count()) {
                $error = $form->getErrors()->current()->getMessage();
            } elseif ($form->get('file')->getErrors()->count()) {
                $error = $form->get('file')->getErrors()->current()->getMessage();
            }

            return new JsonResponse([
                'status' => 0,
                'message' => $error
            ]);
        }

        /* @var $uploader Uploader */
        $uploader = $this->get('anime_db.uploader');
        $filename = $uploader->upload($image->getFile());
        return new JsonResponse([
            'status' => 1,
            'filename' => $filename,
            'web_path' => $uploader->getWebPath().$filename
        ]);
    }

    /**
     * @Route(
     *   "/form/upload_images.json",
     *   name="anime_db_form_upload_images",
     *   condition="request.isXmlHttpRequest()"
     * )
     * @Method({"POST"})
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function uploadImagesAction(Request $request)
    {
        $image = new Images();
        $form = $this
            ->createFormBuilder($image)
            ->add('files', 'file', [
                'multiple' => true,
                'attr' => [
                    'accept' => 'image/*',
                    'multiple' => 'multiple',
                ]
            ])
            ->getForm()
            ->handleRequest($request);

        if ($form->isValid()) {
            $error = $this->get('translator')->trans('word.error.failed_upload_images');
            if ($form->getErrors()->count()) {
                $error = $form->getErrors()->current()->getMessage();
            } elseif ($form->get('files')->getErrors()->count()) {
                $error = $form->get('files')->getErrors()->current()->getMessage();
            }

            return new JsonResponse([
                'status' => 0,
                'message' => $error
            ]);
        }

        /* @var $uploader Uploader */
        $uploader = $this->get('anime_db.uploader');

        $files = [];
        foreach ($image->getFiles() as $file) {
            $filename = $uploader->upload($file);
            $files[] = [
                'filename' => $filename,
                'web_path' => $uploader->getWebPath().$filename
            ];
        }

        return new JsonResponse([
            'status' => 1,
            'files' => $files
        ]);
    }

    /**
     * @Route(
     *   "/form/token/{token_id}/generate.json",
     *   defaults={"token_id" = "form"},
     *   name="anime_db_form_generate_token",
     *   condition="request.isXmlHttpRequest()"
     * )
     * @Method({"POST"})
     *
     * @param string $token_id
     *
     * @return Response
     */
    public function generateTokenAction($token_id)
    {
        /* @var $csrf CsrfTokenManagerInterface */
        $csrf = $this->get('security.csrf.token_manager');
        return new Response($csrf->refreshToken($token_id));
    }
}
