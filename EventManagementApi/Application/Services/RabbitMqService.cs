using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace Application.Services
{
    /// <summary>
    /// Service for publishing events to RabbitMQ message broker.
    /// Enables asynchronous event processing and microservice communication.
    /// </summary>
    public interface IRabbitMqService
    {
        Task PublishAsync<T>(string queueName, T message);
    }

    public class RabbitMqService : IRabbitMqService
    {
        private readonly IConnection _connection;
        private readonly string _hostName;

        public RabbitMqService(string hostName = "localhost")
        {
            _hostName = hostName;
            try
            {
                var factory = new ConnectionFactory
                {
                    HostName = _hostName,
                    DispatchConsumersAsync = true
                };
                _connection = factory.CreateConnection();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"RabbitMQ Connection Warning: {ex.Message}. Operating without message queue.");
            }
        }

        /// <summary>
        /// Publishes a message to a RabbitMQ queue asynchronously.
        /// </summary>
        public async Task PublishAsync<T>(string queueName, T message)
        {
            try
            {
                if (_connection == null || !_connection.IsOpen)
                {
                    Console.WriteLine("RabbitMQ connection not available. Message not published.");
                    return;
                }

                using (var channel = _connection.CreateModel())
                {
                    // Declare queue (idempotent - creates if doesn't exist)
                    channel.QueueDeclare(
                        queue: queueName,
                        durable: true,
                        exclusive: false,
                        autoDelete: false,
                        arguments: null
                    );

                    var json = JsonSerializer.Serialize(message);
                    var body = Encoding.UTF8.GetBytes(json);

                    var properties = channel.CreateBasicProperties();
                    properties.Persistent = true;
                    properties.ContentType = "application/json";

                    channel.BasicPublish(
                        exchange: "",
                        routingKey: queueName,
                        basicProperties: properties,
                        body: body
                    );

                    Console.WriteLine($"Message published to queue '{queueName}'");
                }

                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"RabbitMQ Publish Error: {ex.Message}");
                // Don't throw - allow application to continue even if messaging fails
            }
        }
    }
}
