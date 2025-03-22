package internal

import (
	"context"
	"fmt"
	"io"
	"strings"

	speech "cloud.google.com/go/speech/apiv1"
	"cloud.google.com/go/speech/apiv1/speechpb"
)

type STT struct {
	stream speechpb.Speech_StreamingRecognizeClient
}

func NewSTT(ctx context.Context, client *speech.Client) (*STT, error) {
	stream, err := client.StreamingRecognize(ctx)
	if err != nil {
		return nil, err
	}

	sendReq := &speechpb.StreamingRecognizeRequest{
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
	if err := stream.Send(sendReq); err != nil {
		return nil, err
	}

	return &STT{
		stream: stream,
	}, nil
}

func (s *STT) Close() error {
	return s.stream.CloseSend()
}

func (s *STT) SendAudio(audio []byte) error {
	req := &speechpb.StreamingRecognizeRequest{
		StreamingRequest: &speechpb.StreamingRecognizeRequest_AudioContent{
			AudioContent: audio,
		},
	}
	return s.stream.Send(req)
}

func (s *STT) Result() (string, error) {
	var sb strings.Builder
	for {
		resp, err := s.stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			return "", err
		}
		if err := resp.Error; err != nil {
			return "", fmt.Errorf("error: %v", err)
		}
		for _, result := range resp.Results {
			for _, alt := range result.Alternatives {
				sb.WriteString(alt.Transcript)
			}
		}
	}
	return sb.String(), nil
}
