package speachtotext

import (
	"context"
	"fmt"
	"io"
	"strings"

	speech "cloud.google.com/go/speech/apiv1"
	"cloud.google.com/go/speech/apiv1/speechpb"
)

const (
	checkInterval = 8
)

type GetReaderFunc func() (io.Reader, error)

func SpeechToText(ctx context.Context, client *speech.Client, getReader GetReaderFunc) (string, error) {
	stream, err := newStream(ctx, client)
	if err != nil {
		return "", fmt.Errorf("failed to create stream: %v", err)
	}

	for {
		reader, err := getReader()
		if err == io.EOF {
			break
		}
		if err != nil {
			return "", fmt.Errorf("failed to get reader: %v", err)
		}

		bytes, err := io.ReadAll(reader)
		if err != nil {
			return "", fmt.Errorf("failed to read all: %v", err)
		}
		if err := sendAudio(stream, bytes); err != nil {
			return "", fmt.Errorf("failed to send audio: %v", err)
		}
	}
	return result(stream)
}

func newStream(ctx context.Context, client *speech.Client) (speechpb.Speech_StreamingRecognizeClient, error) {
	ret, err := client.StreamingRecognize(ctx)
	if err != nil {
		return nil, err
	}

	req := &speechpb.StreamingRecognizeRequest{
		StreamingRequest: &speechpb.StreamingRecognizeRequest_StreamingConfig{
			StreamingConfig: &speechpb.StreamingRecognitionConfig{
				Config: &speechpb.RecognitionConfig{
					Encoding:        speechpb.RecognitionConfig_WEBM_OPUS,
					SampleRateHertz: 16000,
					LanguageCode:    "ja-JP",
				},
			},
		},
	}
	if err := ret.Send(req); err != nil {
		return nil, err
	}

	return ret, nil
}

func sendAudio(stream speechpb.Speech_StreamingRecognizeClient, bytes []byte) error {
	req := &speechpb.StreamingRecognizeRequest{
		StreamingRequest: &speechpb.StreamingRecognizeRequest_AudioContent{
			AudioContent: bytes,
		},
	}
	if err := stream.Send(req); err != nil {
		return fmt.Errorf("failed to send audio: %v", err)
	}
	return nil
}

func result(stream speechpb.Speech_StreamingRecognizeClient) (string, error) {
	if err := stream.CloseSend(); err != nil {
		return "", fmt.Errorf("failed to close: %v", err)
	}

	var sb strings.Builder
	for {
		resp, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			return "", fmt.Errorf("failed to receive: %v", err)
		}
		if err := resp.Error; err != nil {
			return "", fmt.Errorf("get error: %v", err)
		}
		for _, result := range resp.Results {
			for _, alt := range result.Alternatives {
				sb.WriteString(alt.Transcript)
			}
		}
	}

	return sb.String(), nil
}
