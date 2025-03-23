package speeachtotext

import (
	"context"
	"fmt"
	"io"
	"strings"

	speech "cloud.google.com/go/speech/apiv1"
	"cloud.google.com/go/speech/apiv1/speechpb"
)

func NewStream(ctx context.Context, client *speech.Client) (speechpb.Speech_StreamingRecognizeClient, error) {
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

func SendAudio(stream speechpb.Speech_StreamingRecognizeClient, bytes []byte) error {
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

func Result(stream speechpb.Speech_StreamingRecognizeClient) (string, error) {
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
